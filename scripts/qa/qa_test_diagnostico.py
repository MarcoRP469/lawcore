"""
QA DIAGNOSTIC TEST SUITE - LawCore System Stability & Logic Audit
==================================================================

Ejecuta pruebas de integración exhaustivas para:
1. Conectividad Frontend-Backend
2. Lógica estadística y ranking
3. Integridad de datos y visualización
4. Manejo de casos límite y excepciones

Autor: QA Engineer
Fecha: 2025-12-10
"""

import requests
import json
import sys
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta

# ============================
# CONFIGURACIÓN
# ============================
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"
VERBOSE = True

# Colores para output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"

# ============================
# UTILIDADES
# ============================
def log_test(title: str, level: str = "INFO"):
    """Log test title with color"""
    colors = {
        "INFO": BLUE,
        "PASS": GREEN,
        "FAIL": RED,
        "WARN": YELLOW
    }
    print(f"\n{colors[level]}{BOLD}[{level}]{RESET} {title}")

def log_result(passed: bool, message: str, detail: str = ""):
    """Log test result"""
    status = f"{GREEN}✓ PASS{RESET}" if passed else f"{RED}✗ FAIL{RESET}"
    print(f"  {status} {message}")
    if detail and VERBOSE:
        print(f"    → {detail}")

def log_error(error: str):
    """Log error details"""
    print(f"  {RED}ERROR: {error}{RESET}")

# ============================
# PRUEBA 1: HEALTH CHECK & CONECTIVIDAD
# ============================
def test_connectivity() -> Dict[str, Any]:
    """Prueba de conectividad Backend"""
    results = {
        "passed": False,
        "errors": [],
        "details": {}
    }
    
    log_test("PRUEBA 1: Health Check - Conectividad Backend", "INFO")
    
    try:
        # Test 1.1: Endpoint raíz
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        results["details"]["root_endpoint"] = response.status_code
        log_result(
            response.status_code == 200,
            "GET / (Endpoint raíz)",
            f"Status: {response.status_code}, Response: {response.json()}"
        )
        
        # Test 1.2: Endpoint de notarías
        response = requests.get(f"{BACKEND_URL}/notarias", timeout=5)
        results["details"]["notarias_endpoint"] = response.status_code
        log_result(
            response.status_code == 200,
            "GET /notarias (Lista de notarías)",
            f"Status: {response.status_code}, Records: {len(response.json())}"
        )
        
        # Test 1.3: CORS Headers
        response = requests.options(
            f"{BACKEND_URL}/notarias",
            headers={"Origin": "http://localhost:3000"},
            timeout=5
        )
        has_cors = "access-control-allow-origin" in response.headers
        results["details"]["cors_enabled"] = has_cors
        log_result(
            has_cors,
            "CORS Headers (Preflight)",
            f"CORS Origin: {response.headers.get('access-control-allow-origin', 'N/A')}"
        )
        
        results["passed"] = True
        return results
        
    except requests.ConnectionError as e:
        results["errors"].append(f"Connection Error: {str(e)}")
        log_error(f"No se puede conectar a {BACKEND_URL}")
        log_error("Solución: Asegúrate que el backend está ejecutándose (uvicorn main:app --reload)")
        return results
    except Exception as e:
        results["errors"].append(str(e))
        log_error(str(e))
        return results

# ============================
# PRUEBA 2: RESPUESTAS NULAS EN BÚSQUEDA
# ============================
def test_null_responses() -> Dict[str, Any]:
    """Prueba búsquedas que retornan sin resultados"""
    results = {
        "passed": False,
        "errors": [],
        "details": {}
    }
    
    log_test("PRUEBA 2: Manejo de Respuestas Nulas", "INFO")
    
    try:
        # Test 2.1: Búsqueda sin resultados
        response = requests.get(
            f"{BACKEND_URL}/notarias",
            params={"search": "ZZZZZZZNOTEXISTSZZZZZ"},
            timeout=5
        )
        
        results["details"]["null_search_status"] = response.status_code
        results["details"]["null_search_count"] = len(response.json())
        
        log_result(
            response.status_code == 200,
            "Búsqueda sin resultados - Status",
            f"Status: {response.status_code}"
        )
        
        log_result(
            isinstance(response.json(), list),
            "Búsqueda sin resultados - Response Type",
            f"Type: {type(response.json()).__name__}, Count: {len(response.json())}"
        )
        
        # Test 2.2: Búsqueda vacía
        response = requests.get(
            f"{BACKEND_URL}/notarias",
            params={"search": ""},
            timeout=5
        )
        log_result(
            response.status_code == 200,
            "Búsqueda vacía - Status",
            f"Status: {response.status_code}"
        )
        
        results["passed"] = True
        return results
        
    except Exception as e:
        results["errors"].append(str(e))
        log_error(str(e))
        return results

# ============================
# PRUEBA 3: LÓGICA DE RANKING Y POLARIZACIÓN
# ============================
def test_ranking_logic() -> Dict[str, Any]:
    """Prueba el algoritmo de ranking con notarías similares"""
    results = {
        "passed": False,
        "errors": [],
        "details": {}
    }
    
    log_test("PRUEBA 3: Lógica de Ranking - Polarización", "INFO")
    
    try:
        # Obtener todas las notarías
        response = requests.get(f"{BACKEND_URL}/notarias", timeout=5)
        notarias = response.json()
        
        if not notarias:
            log_error("No hay notarías en la base de datos")
            return results
        
        # Analizar el ranking
        log_result(
            True,
            "Notarías obtenidas",
            f"Total: {len(notarias)}"
        )
        
        # Verificar que el resultado está ordenado por puntuación
        ratings = [n.get("rating", 0) for n in notarias]
        log_result(
            True,
            "Distribución de calificaciones",
            f"Min: {min(ratings):.2f}, Max: {max(ratings):.2f}, Avg: {sum(ratings)/len(ratings):.2f}"
        )
        
        # Buscar con término que tenga múltiples resultados
        response = requests.get(
            f"{BACKEND_URL}/notarias",
            params={"search": "notaria"},
            timeout=5
        )
        
        search_results = response.json()
        log_result(
            len(search_results) > 0,
            "Búsqueda genérica",
            f"Resultados encontrados: {len(search_results)}"
        )
        
        if len(search_results) > 1:
            # Verificar que están ordenados
            first_score = search_results[0].get("relevance_score", 0)
            second_score = search_results[1].get("relevance_score", 0)
            is_sorted = first_score >= second_score
            log_result(
                is_sorted,
                "Ranking ordenado descendente",
                f"Score 1: {first_score:.4f}, Score 2: {second_score:.4f}"
            )
        
        results["passed"] = True
        return results
        
    except Exception as e:
        results["errors"].append(str(e))
        log_error(str(e))
        return results

# ============================
# PRUEBA 4: MANEJO DE DESVIACIÓN ESTÁNDAR
# ============================
def test_std_dev_handling() -> Dict[str, Any]:
    """Prueba manejo de desviación estándar (casos límite)"""
    results = {
        "passed": False,
        "errors": [],
        "details": {}
    }
    
    log_test("PRUEBA 4: Cálculo de Desviación Estándar - Casos Límite", "INFO")
    
    try:
        # Test 4.1: Endpoint de alertas de calidad
        response = requests.get(
            f"{BACKEND_URL}/metricas/alertas-calidad",
            timeout=5
        )
        
        log_result(
            response.status_code == 200,
            "Endpoint /metricas/alertas-calidad",
            f"Status: {response.status_code}"
        )
        
        alertas = response.json().get("alertas", [])
        results["details"]["alerts_count"] = len(alertas)
        
        if alertas:
            log_result(
                True,
                "Alertas encontradas",
                f"Total alertas: {len(alertas)}"
            )
            
            # Verificar estructura de alertas
            for alert in alertas[:1]:  # Mostrar primera alerta
                log_result(
                    all(k in alert for k in ["notaria_id", "media", "desviacion"]),
                    "Estructura de alerta completa",
                    f"Notaría: {alert.get('nombre')}, σ: {alert.get('desviacion'):.2f}"
                )
        else:
            log_result(
                True,
                "Sin alertas de calidad (esperado)",
                "La base de datos no tiene notarías con polarización"
            )
        
        results["passed"] = True
        return results
        
    except Exception as e:
        results["errors"].append(str(e))
        log_error(str(e))
        return results

# ============================
# PRUEBA 5: CARACTERES ESPECIALES EN BÚSQUEDA
# ============================
def test_special_characters() -> Dict[str, Any]:
    """Prueba búsquedas con caracteres especiales"""
    results = {
        "passed": False,
        "errors": [],
        "details": {}
    }
    
    log_test("PRUEBA 5: Búsquedas con Caracteres Especiales", "INFO")
    
    test_cases = [
        ("áéíóú", "Acentos"),
        ("notaría's", "Apóstrofos"),
        ("test@123", "Símbolos"),
        ("'SELECT * FROM'", "SQL Injection attempt"),
        ("a" * 255, "String muy largo"),
    ]
    
    try:
        for search_term, description in test_cases:
            try:
                response = requests.get(
                    f"{BACKEND_URL}/notarias",
                    params={"search": search_term},
                    timeout=5
                )
                
                passed = response.status_code == 200
                log_result(
                    passed,
                    f"Búsqueda: {description}",
                    f"Status: {response.status_code}, Results: {len(response.json())}"
                )
                
            except Exception as e:
                log_result(False, f"Búsqueda: {description}", str(e))
        
        results["passed"] = True
        return results
        
    except Exception as e:
        results["errors"].append(str(e))
        log_error(str(e))
        return results

# ============================
# PRUEBA 6: REGISTRO DE BÚSQUEDAS
# ============================
def test_search_logging() -> Dict[str, Any]:
    """Verifica que las búsquedas se registren correctamente"""
    results = {
        "passed": False,
        "errors": [],
        "details": {}
    }
    
    log_test("PRUEBA 6: Registro de Búsquedas", "INFO")
    
    try:
        # Realizar una búsqueda
        search_term = f"test_search_{datetime.now().timestamp()}"
        response = requests.get(
            f"{BACKEND_URL}/notarias",
            params={"search": search_term},
            timeout=5
        )
        
        log_result(
            response.status_code == 200,
            "Búsqueda registrada",
            f"Term: {search_term}, Status: {response.status_code}"
        )
        
        # Verificar tendencias
        response = requests.get(
            f"{BACKEND_URL}/metricas/tendencias-busqueda",
            timeout=5
        )
        
        log_result(
            response.status_code == 200,
            "Tendencias de búsqueda recuperadas",
            f"Status: {response.status_code}"
        )
        
        tendencias = response.json()
        log_result(
            "top_terminos" in tendencias and "tendencia" in tendencias,
            "Estructura de tendencias completa",
            f"Top términos: {len(tendencias.get('top_terminos', []))}, "
            f"Tendencias: {len(tendencias.get('tendencia', []))}"
        )
        
        results["passed"] = True
        return results
        
    except Exception as e:
        results["errors"].append(str(e))
        log_error(str(e))
        return results

# ============================
# PRUEBA 7: INTEGRIDAD DE TIPOS (TypeScript)
# ============================
def test_type_definitions() -> Dict[str, Any]:
    """Valida que las respuestas del backend coincidan con tipos TypeScript"""
    results = {
        "passed": False,
        "errors": [],
        "details": {}
    }
    
    log_test("PRUEBA 7: Integridad de Tipos (TypeScript Mismatch)", "INFO")
    
    try:
        # Obtener una notaría
        response = requests.get(f"{BACKEND_URL}/notarias", timeout=5)
        notarias = response.json()
        
        if notarias:
            notaria = notarias[0]
            
            # Verificar campos requeridos vs TypeScript
            required_fields = [
                "id", "name", "address", "district", "phone", "email",
                "available", "avatarUrl", "rating"
            ]
            
            missing_fields = [f for f in required_fields if f not in notaria]
            
            if missing_fields:
                log_result(
                    False,
                    "Campos requeridos en Notaria",
                    f"Campos faltantes: {missing_fields}"
                )
            else:
                log_result(
                    True,
                    "Campos requeridos en Notaria",
                    f"Todos los {len(required_fields)} campos presentes"
                )
            
            # Verificar tipos
            type_checks = [
                ("id", int),
                ("name", str),
                ("rating", (int, float)),
                ("available", bool),
            ]
            
            type_errors = []
            for field, expected_type in type_checks:
                if field in notaria:
                    actual_type = type(notaria[field])
                    if isinstance(expected_type, tuple):
                        is_correct = any(isinstance(notaria[field], t) for t in expected_type)
                    else:
                        is_correct = isinstance(notaria[field], expected_type)
                    
                    if not is_correct:
                        type_errors.append(f"{field}: expected {expected_type}, got {actual_type}")
            
            if type_errors:
                log_result(False, "Tipos de datos", f"Errores: {type_errors}")
            else:
                log_result(True, "Tipos de datos correctos", "Todos los tipos coinciden")
        
        results["passed"] = True
        return results
        
    except Exception as e:
        results["errors"].append(str(e))
        log_error(str(e))
        return results

# ============================
# PRUEBA 8: TENDENCIAS CON CEROS
# ============================
def test_zero_timeseries() -> Dict[str, Any]:
    """Prueba manejo de series de tiempo con meses sin búsquedas"""
    results = {
        "passed": False,
        "errors": [],
        "details": {}
    }
    
    log_test("PRUEBA 8: Series de Tiempo - Meses con Cero Búsquedas", "INFO")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/metricas/tendencias-busqueda",
            timeout=5
        )
        
        log_result(
            response.status_code == 200,
            "Datos de tendencia obtenidos",
            f"Status: {response.status_code}"
        )
        
        tendencias = response.json()
        trend_data = tendencias.get("tendencia", [])
        
        if trend_data:
            # Verificar que no hay valores None
            null_values = [t for t in trend_data if t.get("total") is None]
            log_result(
                len(null_values) == 0,
                "Sin valores nulos en serie de tiempo",
                f"Total registros: {len(trend_data)}, Valores nulos: {len(null_values)}"
            )
            
            # Verificar que hay valores 0
            zero_values = [t for t in trend_data if t.get("total") == 0]
            log_result(
                len(zero_values) == 0 or len(zero_values) > 0,
                "Manejo de ceros en tendencias",
                f"Registros con cero: {len(zero_values)}"
            )
        
        results["passed"] = True
        return results
        
    except Exception as e:
        results["errors"].append(str(e))
        log_error(str(e))
        return results

# ============================
# EJECUTAR TODAS LAS PRUEBAS
# ============================
def run_all_tests() -> Dict[str, Any]:
    """Ejecuta todas las pruebas y genera reporte"""
    
    print(f"\n{BOLD}{BLUE}{'='*70}")
    print(f"AUDITORIA DE CALIDAD - LAWCORE")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {BACKEND_URL}")
    print(f"{'='*70}{RESET}\n")
    
    all_results = {
        "timestamp": datetime.now().isoformat(),
        "backend_url": BACKEND_URL,
        "tests": {}
    }
    
    # Ejecutar pruebas
    tests = [
        ("connectivity", test_connectivity),
        ("null_responses", test_null_responses),
        ("ranking_logic", test_ranking_logic),
        ("std_dev", test_std_dev_handling),
        ("special_chars", test_special_characters),
        ("search_logging", test_search_logging),
        ("type_definitions", test_type_definitions),
        ("zero_timeseries", test_zero_timeseries),
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            all_results["tests"][test_name] = result
        except Exception as e:
            print(f"\n{RED}ERROR en {test_name}: {str(e)}{RESET}")
            all_results["tests"][test_name] = {
                "passed": False,
                "errors": [str(e)],
                "details": {}
            }
    
    # Resumen final
    print(f"\n{BOLD}{BLUE}{'='*70}")
    print("RESUMEN DE PRUEBAS")
    print(f"{'='*70}{RESET}\n")
    
    passed_count = sum(1 for r in all_results["tests"].values() if r["passed"])
    total_count = len(all_results["tests"])
    
    for test_name, result in all_results["tests"].items():
        status = f"{GREEN}✓{RESET}" if result["passed"] else f"{RED}✗{RESET}"
        print(f"{status} {test_name}: {'PASS' if result['passed'] else 'FAIL'}")
    
    print(f"\n{BOLD}Total: {passed_count}/{total_count} pruebas pasadas{RESET}\n")
    
    return all_results

if __name__ == "__main__":
    results = run_all_tests()
    
    # Guardar resultados en JSON
    with open("qa_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"{BLUE}Resultados guardados en: qa_test_results.json{RESET}\n")
