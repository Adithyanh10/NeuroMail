"""
Unit tests for the ML inference pipeline.
"""

import pytest
from app.model.loader import FallbackEmailGenerator
from app.model.inference import preprocess, run_inference


# ── Preprocessing ─────────────────────────────────────────────────────────────

def test_preprocess_strips_headers():
    raw = "From: alice@example.com\nSubject: Meeting\n\nHi, can we meet tomorrow?"
    result = preprocess(raw)
    assert "From:" not in result
    assert "Subject:" not in result
    assert "can we meet tomorrow?" in result


def test_preprocess_truncates_long_input():
    long_email = "a" * (1024 * 4 + 100)
    result = preprocess(long_email)
    assert len(result) <= 1024 * 4


def test_preprocess_collapses_blank_lines():
    raw = "Hello\n\n\n\nWorld"
    result = preprocess(raw)
    assert "\n\n\n" not in result


# ── Fallback Generator ────────────────────────────────────────────────────────

@pytest.mark.parametrize("tone", ["professional", "formal", "friendly"])
def test_fallback_generator_all_tones(tone):
    model = FallbackEmailGenerator()
    result = model.generate("Please send me the report.", tone)
    assert "reply" in result
    assert isinstance(result["reply"], str)
    assert len(result["reply"]) > 0
    assert "confidence" in result


def test_fallback_generator_unknown_tone_defaults():
    model = FallbackEmailGenerator()
    result = model.generate("Hello", "unknown_tone")
    assert result["reply"]  # should not crash, falls back to professional


# ── run_inference ─────────────────────────────────────────────────────────────

def test_run_inference_returns_expected_keys():
    model = FallbackEmailGenerator()
    result = run_inference(model, "Can you send me the invoice?", "formal")
    assert "reply" in result
    assert "confidence" in result
    assert isinstance(result["confidence"], float)


def test_run_inference_unsupported_model_raises():
    with pytest.raises(ValueError, match="Unsupported model interface"):
        run_inference(object(), "test email", "professional")
