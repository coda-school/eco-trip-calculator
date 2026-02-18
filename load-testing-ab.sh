#!/bin/bash

# Script de test de charge avec Apache Bench (ab)

HOST=${1:-localhost}
PORT=${2:-3000}
BASE_URL="http://${HOST}:${PORT}"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Nombre de requêtes et concurrence par défaut
REQUESTS=1000
CONCURRENCY=10

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Test de charge Backend - Eco Trip Calculator      ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}Host:${NC} ${HOST}:${PORT}"
echo -e "${BLUE}Requests:${NC} ${REQUESTS} | ${BLUE}Concurrency:${NC} ${CONCURRENCY}"
echo ""

# Vérifier si ab est installé
if ! command -v ab &> /dev/null; then
    echo -e "${YELLOW}⚠️  Apache Bench (ab) n'est pas installé${NC}"
    echo "Installation:"
    echo "  - macOS: brew install httpd"
    echo "  - Ubuntu/Debian: apt-get install apache2-utils"
    exit 1
fi

# Vérifier si le serveur est accessible
echo -e "${BLUE}🔍 Vérification de la disponibilité du serveur...${NC}"
if ! curl -s "${BASE_URL}/api/history" > /dev/null; then
    echo -e "${YELLOW}⚠️  Le serveur n'est pas accessible sur ${BASE_URL}${NC}"
    echo "Assurez-vous que le backend est démarré avec: npm run start:backend"
    exit 1
fi
echo -e "${GREEN}✓ Serveur accessible${NC}"
echo ""

# Créer les fichiers de données de test temporaires
TEMP_DIR=$(mktemp -d)
trap "rm -rf ${TEMP_DIR}" EXIT

# Données pour POST /api/calculate
cat > "${TEMP_DIR}/calculate.json" << 'EOF'
{
  "distance": 100,
  "transport": "car",
  "carType": "thermal",
  "passengers": 1,
  "country": "France"
}
EOF

# Données pour POST /api/compare
cat > "${TEMP_DIR}/compare.json" << 'EOF'
{
  "trip1": {
    "distance": 100,
    "transport": "car",
    "carType": "thermal",
    "passengers": 1,
    "country": "France"
  },
  "trip2": {
    "distance": 100,
    "transport": "train",
    "country": "France"
  }
}
EOF

# ========================================
# TESTS D'ERREURS - Données invalides
# ========================================

# Erreur 1: Distance négative
cat > "${TEMP_DIR}/error_negative_distance.json" << 'EOF'
{
  "distance": -100,
  "transport": "car",
  "carType": "thermal",
  "passengers": 1,
  "country": "France"
}
EOF

# Erreur 2: Distance null
cat > "${TEMP_DIR}/error_null_distance.json" << 'EOF'
{
  "distance": null,
  "transport": "car",
  "carType": "thermal",
  "passengers": 1,
  "country": "France"
}
EOF

# Erreur 3: Transport invalide
cat > "${TEMP_DIR}/error_invalid_transport.json" << 'EOF'
{
  "distance": 100,
  "transport": "rocket",
  "carType": "thermal",
  "passengers": 1,
  "country": "France"
}
EOF

# Erreur 4: Champs manquants
cat > "${TEMP_DIR}/error_missing_fields.json" << 'EOF'
{
  "distance": 100
}
EOF

# Erreur 5: Types incorrects
cat > "${TEMP_DIR}/error_wrong_types.json" << 'EOF'
{
  "distance": "not a number",
  "transport": 123,
  "carType": true,
  "passengers": "one",
  "country": []
}
EOF

# Erreur 6: Passengers négatif
cat > "${TEMP_DIR}/error_negative_passengers.json" << 'EOF'
{
  "distance": 100,
  "transport": "car",
  "carType": "thermal",
  "passengers": -5,
  "country": "France"
}
EOF

# Erreur 7: Passengers à zéro (division par zéro)
cat > "${TEMP_DIR}/error_zero_passengers.json" << 'EOF'
{
  "distance": 100,
  "transport": "car",
  "carType": "thermal",
  "passengers": 0,
  "country": "France"
}
EOF

# Erreur 8: CarType invalide
cat > "${TEMP_DIR}/error_invalid_cartype.json" << 'EOF'
{
  "distance": 100,
  "transport": "car",
  "carType": "nuclear",
  "passengers": 1,
  "country": "France"
}
EOF

# Erreur 9: Payload vide
cat > "${TEMP_DIR}/error_empty.json" << 'EOF'
{}
EOF

# Erreur 10: JSON malformé (sera géré par ab)
cat > "${TEMP_DIR}/error_malformed.json" << 'EOF'
{invalid json
EOF

# Erreur 11: Compare avec données invalides
cat > "${TEMP_DIR}/error_compare_invalid.json" << 'EOF'
{
  "trip1": null,
  "trip2": null
}
EOF

# Erreur 12: Compare avec champs manquants
cat > "${TEMP_DIR}/error_compare_missing.json" << 'EOF'
{
  "trip1": {
    "distance": 100
  }
}
EOF

# Test 1: GET /api/history
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📊 Test 1: GET /api/history${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${REQUESTS} -c ${CONCURRENCY} \
   -H "Content-Type: application/json" \
   "${BASE_URL}/api/history"
echo ""

# Test 2: GET /api/stats
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📊 Test 2: GET /api/stats${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${REQUESTS} -c ${CONCURRENCY} \
   -H "Content-Type: application/json" \
   "${BASE_URL}/api/stats"
echo ""

# Test 3: POST /api/calculate
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📊 Test 3: POST /api/calculate${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${REQUESTS} -c ${CONCURRENCY} \
   -p "${TEMP_DIR}/calculate.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate"
echo ""

# Test 4: POST /api/compare
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📊 Test 4: POST /api/compare${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${REQUESTS} -c ${CONCURRENCY} \
   -p "${TEMP_DIR}/compare.json" \
   -T "application/json" \
   "${BASE_URL}/api/compare"
echo ""

# ========================================
# TESTS D'ERREURS
# ========================================
echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║          TESTS D'ERREURS - Données invalides           ║${NC}"
echo -e "${YELLOW}║                                                        ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Réduire le nombre de requêtes pour les tests d'erreur
ERROR_REQUESTS=500
ERROR_CONCURRENCY=10

# Test E1: Distance négative
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E1: Distance négative${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_negative_distance.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e1.txt"
echo ""

# Test E2: Distance null
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E2: Distance null${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_null_distance.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e2.txt"
echo ""

# Test E3: Transport invalide
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E3: Transport invalide${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_invalid_transport.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e3.txt"
echo ""

# Test E4: Champs manquants
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E4: Champs manquants${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_missing_fields.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e4.txt"
echo ""

# Test E5: Types incorrects
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E5: Types incorrects${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_wrong_types.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e5.txt"
echo ""

# Test E6: Passengers négatif
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E6: Passengers négatif${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_negative_passengers.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e6.txt"
echo ""

# Test E7: Division par zéro (passengers = 0)
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E7: Passengers à zéro (division par zéro)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_zero_passengers.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e7.txt"
echo ""

# Test E8: CarType invalide
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E8: CarType invalide${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_invalid_cartype.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e8.txt"
echo ""

# Test E9: Payload vide
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E9: Payload vide${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_empty.json" \
   -T "application/json" \
   "${BASE_URL}/api/calculate" 2>&1 | tee "${TEMP_DIR}/result_e9.txt"
echo ""

# Test E10: Compare avec données invalides
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E10: Compare avec données invalides${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_compare_invalid.json" \
   -T "application/json" \
   "${BASE_URL}/api/compare" 2>&1 | tee "${TEMP_DIR}/result_e10.txt"
echo ""

# Test E11: Compare avec champs manquants
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Test E11: Compare avec champs manquants${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
ab -n ${ERROR_REQUESTS} -c ${ERROR_CONCURRENCY} \
   -p "${TEMP_DIR}/error_compare_missing.json" \
   -T "application/json" \
   "${BASE_URL}/api/compare" 2>&1 | tee "${TEMP_DIR}/result_e11.txt"
echo ""

# Génération du rapport d'erreurs
echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║            RAPPORT DES TESTS D'ERREURS                 ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

REPORT_FILE="${TEMP_DIR}/error_report.txt"
echo "=== RAPPORT DES TESTS D'ERREURS ===" > "${REPORT_FILE}"
echo "Date: $(date)" >> "${REPORT_FILE}"
echo "Backend: ${BASE_URL}" >> "${REPORT_FILE}"
echo "Requêtes par test: ${ERROR_REQUESTS}" >> "${REPORT_FILE}"
echo "Concurrence: ${ERROR_CONCURRENCY}" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"

for i in {1..11}; do
    if [ -f "${TEMP_DIR}/result_e${i}.txt" ]; then
        echo "--- Test E${i} ---" >> "${REPORT_FILE}"

        # Extraire les métriques clés
        grep -E "Failed requests:|Non-2xx responses:|Requests per second:|Time per request:" \
            "${TEMP_DIR}/result_e${i}.txt" >> "${REPORT_FILE}" 2>/dev/null || echo "Aucune donnée" >> "${REPORT_FILE}"

        echo "" >> "${REPORT_FILE}"
    fi
done

# Afficher le rapport
cat "${REPORT_FILE}"
echo ""

# Sauvegarder le rapport dans le dossier courant
FINAL_REPORT="./tests-report-$(date +%Y%m%d-%H%M%S).txt"
cp "${REPORT_FILE}" "${FINAL_REPORT}"
echo -e "${GREEN}📄 Rapport sauvegardé dans: ${FINAL_REPORT}${NC}"
echo ""

# Résumé
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Tests terminés                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✅ Tous les tests de charge ont été exécutés${NC}"
echo -e "${GREEN}✅ Tests d'erreurs: rapport sauvegardé dans ${FINAL_REPORT}${NC}"
echo ""
echo -e "${YELLOW}💡 Métriques importantes à vérifier :${NC}"
echo "  - Requests per second [#/sec] (moyenne)"
echo "  - Time per request [ms] (moyenne)"
echo "  - Failed requests (pour tests normaux: doit être 0)"
echo "  - Non-2xx responses (tests d'erreurs: indique la gestion d'erreurs)"
echo ""
echo -e "${YELLOW}💡 Analyse des tests d'erreurs :${NC}"
echo "  - Failed requests = exceptions non gérées → crash du backend"
echo "  - Non-2xx responses = erreurs gérées → réponses HTTP d'erreur (4xx/5xx)"
echo "  - Ces métriques vous aideront à comparer avant/après refactoring vers monads"
echo ""
echo -e "${YELLOW}💡 Pour personnaliser les tests :${NC}"
echo "  - Modifier REQUESTS/ERROR_REQUESTS et CONCURRENCY dans le script"
echo "  - Exemple: REQUESTS=5000 ERROR_REQUESTS=1000 ./test-backend-load.sh"
