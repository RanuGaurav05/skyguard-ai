"""
SkyGuard AI - LSTM Autoencoder (temporal anomaly detection)
Path: 01_ml/03_src/04_temporal/lstm_autoencoder.py

The core idea: this model is trained to RECONSTRUCT a 7-day sequence of (avg_temp, air_pressure, relative_humidity) — and it only ever sees NORMAL
sequences during training. It never learns what a fault looks like.

At test time, we feed it every kind of sequence (normal and anomalous) and measure the reconstruction error. On normal data the model reconstructs
well (low error, since it has seen this pattern before). On an anomalous sequence — a spike, a stuck sensor, a drift — the pattern doesn't match
anything the model learned, so it reconstructs it poorly (high error).

That error itself becomes the anomaly score.

Note: a genuine regional event can also produce a high reconstruction error here, since this model only knows one station's own history and has no
spatial context. That's expected and fine — the Spatial Correlation Engine(next step) is what tells a real regional event apart from an isolated
sensor fault. This model's job is only to flag "this doesn't match the station's normal temporal pattern."
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use("Agg")  # no display needed, just saves files
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

sys.path.insert(0, "../04_temporal")  # so sequence_prep is importable when run from elsewhere
from sequence_prep import (
    interpolate_short_gaps, assign_chunk_ids, build_sequences,
    chronological_sequence_split, CORE_FEATURES,
)

SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)

# Maps each specific anomaly_type to its parent anomaly_category — lets us build sequences ONCE (with the fine-grained type as the label) and still
# get both the category-level and type-level recall breakdown from that one build.

TYPE_TO_CATEGORY = {
    "SUDDEN_SPIKE": "SENSOR_FAULT",
    "STUCK_AT": "SENSOR_FAULT",
    "GRADUAL_DRIFT": "SENSOR_FAULT",
    "MISSING_RECORD": "TRANSMISSION_GLITCH",
    "REGIONAL_HEAT_EVENT": "GENUINE_EVENT",
    "REGIONAL_PRESSURE_DROP": "GENUINE_EVENT",
    "NORMAL": "NORMAL",
}


def scale_sequences(X_train, X_val, X_test):
    """Fits a StandardScaler on TRAIN data only (flattened across time steps),
    then applies the same scaling to val/test — never fit on val or test."""
    n_features = X_train.shape[2]
    scaler = StandardScaler()
    scaler.fit(X_train.reshape(-1, n_features))

    def _apply(X):
        shape = X.shape
        return scaler.transform(X.reshape(-1, n_features)).reshape(shape)

    return _apply(X_train), _apply(X_val), _apply(X_test), scaler


def build_model(seq_len: int, n_features: int) -> keras.Model:
    """Simple encoder-decoder LSTM. The encoder compresses the 7-day window
    into a single vector; the decoder tries to rebuild the original sequence
    from just that vector — forcing it to learn the underlying pattern
    rather than copying the input straight through."""

    model = keras.Sequential([
        layers.Input(shape=(seq_len, n_features)),
        layers.LSTM(32, activation="tanh", return_sequences=False, name="encoder"),
        layers.RepeatVector(seq_len),
        layers.LSTM(32, activation="tanh", return_sequences=True, name="decoder"),
        layers.TimeDistributed(layers.Dense(n_features), name="output"),
    ])
    model.compile(optimizer="adam", loss="mse")
    return model


def reconstruction_error(model: keras.Model, X: np.ndarray) -> np.ndarray:
    """Per-sequence MSE between input and reconstruction — this is the anomaly score."""
    X_pred = model.predict(X, verbose=0)
    return np.mean(np.square(X - X_pred), axis=(1, 2))


def choose_threshold(val_errors: np.ndarray, percentile: float = 99.0) -> float:
    """Threshold picked from NORMAL validation errors only — the model has never trained on these sequences, so this is a fair estimate of "how
    wrong the model normally is." Anything above this percentile on unseen normal data is treated as unusually high error going forward."""
    return float(np.percentile(val_errors, percentile))


def evaluate(test_errors: np.ndarray, y_window_test: np.ndarray, threshold: float):
    flagged = test_errors > threshold
    results = {}
    for label in np.unique(y_window_test):
        mask = y_window_test == label
        catch_rate = flagged[mask].mean()
        results[label] = {"count": int(mask.sum()), "flagged_rate": float(catch_rate)}
    return results


def plot_training_curve(history, out_dir: str):
    """Train vs val loss over epochs — shows whether training actually converged."""
    plt.figure(figsize=(8, 5))
    plt.plot(history.history["loss"], label="train loss")
    plt.plot(history.history["val_loss"], label="val loss")
    plt.xlabel("Epoch")
    plt.ylabel("MSE loss")
    plt.title("LSTM Autoencoder — Training Curve")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{out_dir}/1_training_curve.png", dpi=150)
    plt.close()


def plot_error_distribution(val_errors, test_errors, y_window_test, threshold, out_dir: str):
    """Reconstruction error histograms: val-normal (used to set the threshold),
    test-normal, and test-anomalous — with the threshold line drawn in.
    This is the single most useful plot for explaining the model to judges:
    it shows visually how well anomalous sequences separate from normal ones."""
    normal_test = test_errors[y_window_test == "NORMAL"]
    anomaly_test = test_errors[y_window_test != "NORMAL"]

    plt.figure(figsize=(9, 5))
    plt.hist(val_errors, bins=50, alpha=0.5, label="val (NORMAL, unseen)", color="#7fa3c9")
    plt.hist(normal_test, bins=50, alpha=0.5, label="test — NORMAL", color="#4d8067")
    plt.hist(anomaly_test, bins=50, alpha=0.5, label="test — ANOMALY (all types)", color="#c97f7f")
    plt.axvline(threshold, color="black", linestyle="--", linewidth=1.5,
                label=f"threshold = {threshold:.4f}")
    plt.xlabel("Reconstruction error (MSE)")
    plt.ylabel("Number of sequences")
    plt.title("Reconstruction Error Distribution")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{out_dir}/2_error_distribution.png", dpi=150)
    plt.close()

    # same plot, log-scale y-axis — the normal bars are much taller than the
    # anomaly bars, so a log scale makes the overlap/separation easier to see
    plt.figure(figsize=(9, 5))
    plt.hist(normal_test, bins=50, alpha=0.6, label="test — NORMAL", color="#4d8067")
    plt.hist(anomaly_test, bins=50, alpha=0.6, label="test — ANOMALY (all types)", color="#c97f7f")
    plt.axvline(threshold, color="black", linestyle="--", linewidth=1.5,
                label=f"threshold = {threshold:.4f}")
    plt.yscale("log")
    plt.xlabel("Reconstruction error (MSE)")
    plt.ylabel("Number of sequences (log scale)")
    plt.title("Reconstruction Error Distribution — log scale")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{out_dir}/3_error_distribution_logscale.png", dpi=150)
    plt.close()


def plot_recall_by_type(y_type_test, flagged_test, out_dir: str):
    """Bar chart of recall per specific anomaly type — the main results chart."""
    labels = sorted(set(y_type_test))
    rates = []
    counts = []
    for label in labels:
        mask = y_type_test == label
        rates.append(flagged_test[mask].mean() * 100)
        counts.append(mask.sum())

    colors = ["#4d8067" if l == "NORMAL" else "#b8842f" for l in labels]
    plt.figure(figsize=(9, 5))
    bars = plt.bar(labels, rates, color=colors)
    for bar, count in zip(bars, counts):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1.5,
                  f"n={count}", ha="center", fontsize=8, color="#555")
    plt.ylabel("Flagged rate (%)")
    plt.title("LSTM Autoencoder — Recall by Anomaly Type (test set)")
    plt.xticks(rotation=30, ha="right")
    plt.ylim(0, 100)
    plt.grid(alpha=0.3, axis="y")
    plt.tight_layout()
    plt.savefig(f"{out_dir}/4_recall_by_type.png", dpi=150)
    plt.close()


if __name__ == "__main__":
    INPUT_PATH = "01_ml/01_data/03_synthetic/skyguard_anomaly_dataset.csv"
    MODEL_DIR = "01_ml/04_models/02_LSTM_model"
    PLOTS_DIR = "01_ml/05_outputs/plots"  

    df = pd.read_csv(INPUT_PATH)
    df = interpolate_short_gaps(df, "air_pressure")
    df = assign_chunk_ids(df)

    # Build sequences ONCE using the fine-grained anomaly_type as the label
    # (NaN on normal days). The category-level label is then just a lookup
    # via TYPE_TO_CATEGORY, so we get both breakdowns from a single build.
    X, _, y_daily, meta_df = build_sequences(
        df, seq_len=7, features=CORE_FEATURES, label_col="anomaly_type"
    )

    def _window_label(row_labels):
        non_null = [l for l in row_labels if pd.notna(l)]
        return non_null[0] if non_null else "NORMAL"

    y_type_window = np.array([_window_label(row) for row in y_daily])
    y_window = np.array([TYPE_TO_CATEGORY.get(t, t) for t in y_type_window])

    splits = chronological_sequence_split(X, y_window, y_daily, meta_df)
    val_end = pd.Timestamp("2024-06-29")
    test_mask = meta_df["start_date"] >= val_end
    y_type_test = y_type_window[test_mask.values]  # same test rows, finer labels

    X_train = splits["train"]["X"]
    X_val = splits["val"]["X"]
    X_test = splits["test"]["X"]
    y_window_test = splits["test"]["y_window"]

    print(f"train={X_train.shape}  val={X_val.shape}  test={X_test.shape}")

    X_train_s, X_val_s, X_test_s, scaler = scale_sequences(X_train, X_val, X_test)

    model = build_model(seq_len=7, n_features=len(CORE_FEATURES))
    model.summary()

    MAX_EPOCHS = 250
    early_stop = keras.callbacks.EarlyStopping(
        monitor="val_loss", patience=10, restore_best_weights=True
    )
    history = model.fit(
        X_train_s, X_train_s,
        validation_data=(X_val_s, X_val_s),
        epochs=MAX_EPOCHS, batch_size=64, shuffle=True,
        callbacks=[early_stop], verbose=2,
    )

    epochs_run = len(history.history["loss"])
    best_epoch = int(np.argmin(history.history["val_loss"])) + 1
    print(f"\n=== TRAINING CONVERGENCE ===")
    print(f"Epochs run: {epochs_run}/{MAX_EPOCHS}  "
          f"({'early-stopped, converged' if epochs_run < MAX_EPOCHS else 'hit epoch cap -- may still be improving'})")
    print(f"Best val_loss at epoch {best_epoch}: {min(history.history['val_loss']):.5f}")

    val_errors = reconstruction_error(model, X_val_s)
    threshold = choose_threshold(val_errors, percentile=99.0)
    print(f"\nThreshold (99th percentile of val reconstruction error): {threshold:.5f}")

    test_errors = reconstruction_error(model, X_test_s)
    results = evaluate(test_errors, y_window_test, threshold)

    print("\n=== RECALL PER CATEGORY (test set) ===")
    for label, r in results.items():
        print(f"  {label:15s}: {r['flagged_rate']*100:5.1f}%  (n={r['count']})")

    flagged_test = test_errors > threshold
    print("\n=== RECALL PER SPECIFIC ANOMALY TYPE (test set) ===")
    for label in sorted(set(y_type_test)):
        mask = y_type_test == label
        rate = flagged_test[mask].mean()
        print(f"  {label:25s}: {rate*100:5.1f}%  (n={mask.sum()})")

    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(f"{MODEL_DIR}/lstm_autoencoder_1.keras")
    joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")
    joblib.dump({"threshold": threshold}, f"{MODEL_DIR}/threshold.pkl")
    pd.DataFrame(history.history).to_csv(f"{MODEL_DIR}/training_history.csv", index=False)
    print(f"\nSaved model, scaler, threshold, training_history.csv to {MODEL_DIR}/")

    os.makedirs(PLOTS_DIR, exist_ok=True)
    plot_training_curve(history, PLOTS_DIR)
    plot_error_distribution(val_errors, test_errors, y_window_test, threshold, PLOTS_DIR)
    plot_recall_by_type(y_type_test, flagged_test, PLOTS_DIR)
    print(f"Saved 4 graphs to {PLOTS_DIR}/")