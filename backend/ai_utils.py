from typing import List
from collections import Counter
import re

def generate_summary(comments: List[dict]) -> str:
    """
    Generates a simple summary based on a list of comments.
    Each comment is expected to be a dict (or object) with 'text' and 'rating'.
    """
    if not comments:
        return "No hay comentarios suficientes para generar un resumen."

    total_comments = len(comments)
    avg_rating = sum(c.rating for c in comments) / total_comments

    # Simple sentiment based on rating
    if avg_rating >= 4.5:
        sentiment = "excelente"
    elif avg_rating >= 4.0:
        sentiment = "muy positiva"
    elif avg_rating >= 3.0:
        sentiment = "regular"
    else:
        sentiment = "negativa"

    # Extract keywords (very basic)
    all_text = " ".join([c.text for c in comments]).lower()
    # Basic stop words in Spanish
    stop_words = set([
        "de", "la", "que", "el", "en", "y", "a", "los", "se", "del", "las", "un", "por", "con", "no", "una", "su", "para", "es", "al", "lo", "como", "mas", "pero", "sus", "le", "ya", "o", "fue", "este", "muy", "son", "está", "ha", "me", "mi", "nos"
    ])

    words = re.findall(r'\w+', all_text)
    filtered_words = [w for w in words if w not in stop_words and len(w) > 3]
    common_words = Counter(filtered_words).most_common(3)

    keywords_str = ""
    if common_words:
        keywords = [w[0] for w in common_words]
        keywords_str = f" Los usuarios mencionan frecuentemente: {', '.join(keywords)}."

    summary = (
        f"Basado en {total_comments} comentarios, la percepción general es {sentiment} "
        f"(calificación promedio de {avg_rating:.1f}/5.0).{keywords_str}"
    )

    return summary
