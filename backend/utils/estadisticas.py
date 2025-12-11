import math

def normalizar_valor(valor, min_val, max_val, invertir=False):
    """
    Normaliza un valor entre 0 y 1.
    Si invertir es True, 1 será para el valor más bajo (útil para distancia).
    Si max_val == min_val (todos los valores iguales), retorna 0.5 (neutral).
    """
    if max_val == min_val:
        return 0.5  # ✓ Valor neutral cuando todos los valores son iguales
    
    norm = (valor - min_val) / (max_val - min_val)
    if invertir:
        return 1.0 - norm
    return norm

def calcular_distancia_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula distancia en km entre dos coordenadas usando Haversine formula.
    
    Args:
        lat1, lon1: Coordenadas del usuario
        lat2, lon2: Coordenadas de la notaría
    
    Returns:
        Distancia en km
    """
    # Convertir a radianes
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Diferencias
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Haversine formula
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radio de la Tierra en km
    r = 6371
    
    return c * r

def calcular_tasa_conversion(comentarios_count: int, visitas_count: int) -> float:
    """
    Calcula tasa de conversión = comentarios / visitas.
    
    Args:
        comentarios_count: Número de comentarios
        visitas_count: Número de visitas
    
    Returns:
        Tasa entre 0 y 1
    """
    if visitas_count == 0:
        return 0.0
    
    tc = comentarios_count / visitas_count
    return min(tc, 1.0)  # Cap en 1.0

def calcular_desviacion_estandar(datos: list, min_muestra: int = 5) -> tuple:
    """
    Calcula desviación estándar con validación de muestra mínima.
    
    Args:
        datos: Lista de números (calificaciones)
        min_muestra: Mínimo de datos para considerar "válido" (default 5)
    
    Returns:
        Tuple: (media, desviacion, varianza, es_valida)
        es_valida = False si n < min_muestra
    """
    n = len(datos)
    
    if n == 0:
        return 0.0, 0.0, 0.0, False
    
    media = sum(datos) / n
    
    # Si no hay suficientes muestras, no es confiable calcular σ
    if n < min_muestra:
        return media, None, None, False
    
    varianza = sum((x - media) ** 2 for x in datos) / n
    desviacion = math.sqrt(varianza)
    
    return media, desviacion, varianza, True

def calcular_puntuacion_relevancia(distancia_norm, calificacion_norm, servicio_match_norm, conversion_norm, pesos=None):
    """
    Calcula el puntaje R basado en los factores normalizados.
    R = (W_Dist * V_Dist) + (W_Calif * V_Calif) + (W_Serv * V_Serv) + (W_Conv * V_Conv)
    """
    if pesos is None:
        # Pesos por defecto sugeridos
        pesos = {
            "distancia": 0.4,
            "calificacion": 0.3,
            "servicio": 0.2,
            "conversion": 0.1
        }
        
    score = (
        (pesos["distancia"] * distancia_norm) +
        (pesos["calificacion"] * calificacion_norm) +
        (pesos["servicio"] * servicio_match_norm) +
        (pesos["conversion"] * conversion_norm)
    )
    return score
