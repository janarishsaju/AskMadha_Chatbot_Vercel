#!/usr/bin/env bash
#
# prerequisite.sh — verify a developer machine is ready to work on madhatvai.
# Run from repo root:  bash prerequisite.sh
#
# Exit code 0 = ready, 1 = one or more required checks failed.

set -u

# ---- config -----------------------------------------------------------------
REQUIRED_NODE="24.16.0"
ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

# ---- output helpers ---------------------------------------------------------
GREEN="\033[0;32m"; RED="\033[0;31m"; YELLOW="\033[0;33m"; BLUE="\033[0;34m"; RESET="\033[0m"
FAIL=0
WARN=0
WARN_MSGS=""

pass() { printf "  ${GREEN}✔${RESET} %s\n" "$1"; }
fail() { printf "  ${RED}✗${RESET} %s\n" "$1"; FAIL=$((FAIL + 1)); }
warn() { printf "  ${YELLOW}!${RESET} %s\n" "$1"; WARN=$((WARN + 1)); WARN_MSGS="${WARN_MSGS}  ${YELLOW}!${RESET} $1\n"; }
section() { printf "\n${BLUE}== %s ==${RESET}\n" "$1"; }

have() { command -v "$1" >/dev/null 2>&1; }

# ---- 1. core toolchain ------------------------------------------------------
section "Core toolchain"

if have node; then
  NODE_V="$(node -v | sed 's/^v//')"
  if [ "$NODE_V" = "$REQUIRED_NODE" ]; then
    pass "node $NODE_V"
  else
    fail "node $NODE_V (need $REQUIRED_NODE — run 'nvm use')"
  fi
else
  fail "node not found (install nvm, then 'nvm install $REQUIRED_NODE')"
fi

if have npm; then pass "npm $(npm -v)"; else fail "npm not found"; fi
if have git; then pass "git $(git --version | awk '{print $3}')"; else fail "git not found"; fi

if have nvm || [ -s "$HOME/.nvm/nvm.sh" ]; then pass "nvm installed"; else warn "nvm not found (recommended for node version pinning)"; fi
if have watchman; then pass "watchman installed"; else warn "watchman not found (recommended for Metro file watching: brew install watchman)"; fi

# ---- 2. expo / eas ----------------------------------------------------------
section "Expo / EAS"

if have npx; then pass "npx available (expo runs via 'npx expo')"; else fail "npx not found"; fi
if have eas; then pass "eas-cli $(eas --version 2>/dev/null | head -1)"; else warn "eas-cli not found (needed for builds: npm i -g eas-cli)"; fi

# ---- 3. dependencies --------------------------------------------------------
section "Dependencies"

if [ -d node_modules ]; then
  pass "node_modules present"
else
  fail "node_modules missing (run 'npm install')"
fi

# ---- 4. environment variables -----------------------------------------------
section "Environment ($ENV_FILE)"

if [ -f "$ENV_FILE" ]; then
  pass "$ENV_FILE exists"
  if [ -f "$ENV_EXAMPLE" ]; then
    # every KEY in example must exist and be non-empty + not a placeholder in .env
    while IFS= read -r line; do
      case "$line" in ""|\#*) continue;; esac
      key="${line%%=*}"
      val="$(grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2-)"
      if [ -z "$val" ]; then
        fail "$key missing or empty in $ENV_FILE"
      elif printf '%s' "$val" | grep -qiE 'your_|changeme|placeholder'; then
        fail "$key still a placeholder in $ENV_FILE"
      else
        pass "$key set"
      fi
    done < "$ENV_EXAMPLE"
  else
    warn "$ENV_EXAMPLE not found — cannot verify required keys"
  fi
else
  fail "$ENV_FILE missing (copy from $ENV_EXAMPLE: cp $ENV_EXAMPLE $ENV_FILE)"
fi

# ---- 5. native build tooling (optional, platform-aware) ---------------------
section "Native build tooling (optional)"

# iOS — macOS only
if [ "$(uname)" = "Darwin" ]; then
  if have xcodebuild; then
    XC_V="$(xcodebuild -version 2>/dev/null | head -1 | grep -oE '[0-9]+(\.[0-9]+)+' | head -1)"
    if [ -n "$XC_V" ]; then
      pass "Xcode $XC_V"
    else
      warn "Xcode CLI present but no version selected (run 'xcode-select --install' / 'sudo xcode-select -s')"
    fi
  else
    warn "Xcode not found (needed for 'npm run ios')"
  fi
  if have pod; then pass "cocoapods $(pod --version)"; else warn "cocoapods not found (needed for iOS native builds: brew install cocoapods)"; fi
fi

# Android
if have java; then
  JAVA_V="$(java -version 2>&1 | head -1 | awk -F'"' '{print $2}')"
  pass "java ${JAVA_V:-(installed, version unknown)}"
else
  warn "java not found (needed for 'npm run android')"
fi
if [ -n "${ANDROID_HOME:-}" ] || [ -n "${ANDROID_SDK_ROOT:-}" ]; then pass "Android SDK env set"; else warn "ANDROID_HOME/ANDROID_SDK_ROOT not set (needed for Android builds)"; fi
if have adb; then pass "adb available"; else warn "adb not found (Android platform-tools)"; fi

# ---- summary ----------------------------------------------------------------
section "Summary"
if [ "$WARN" -gt 0 ]; then
  printf "${YELLOW}%d optional warning(s):${RESET}\n" "$WARN"
  printf "$WARN_MSGS"
  printf "\n"
fi
if [ "$FAIL" -eq 0 ]; then
  printf "${GREEN}Ready for development.${RESET}"
  [ "$WARN" -gt 0 ] && printf " (%d optional warning(s) above — install only if needed)" "$WARN"
  printf "\n\nStart with:  ${BLUE}npm start${RESET}\n"
  exit 0
else
  printf "${RED}%d required check(s) failed.${RESET} Fix above, re-run.\n" "$FAIL"
  exit 1
fi
