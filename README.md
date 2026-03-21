# Ancient Civilizations Timeline - Runbook & Model Switching

This repository hosts the interactive timeline visualization used in our research. The project is currently hosted publicly on GitHub Pages and can be updated via the included runbook and toggle script for quick model switching.

Public Runbook (GitHub Pages exposure)
- The live demo is at: https://rterrile7.github.io/ancient-civilizations-timeline
- The GitHub repo is at: https://github.com/rterrile7/ancient-civilizations-timeline
- Runbook: MODEL-SWITCHING.md (local) and the README’s Runbook section (this file)

Two-command quick-toggle script (local on your Mac):
- A small helper you can run to switch between OSS 20B and high-end models without typing multiple commands repeatedly.

Copy the script below to a file and make it executable:

```
#!/usr/bin/env bash
set -euo pipefail

case "${1:-}" in
  oss|oss20|oss20b)
    openclaw models set ollama/gpt-oss:20b
    ;;
  sonnet|sonnet4|sonnet-4-6|sonnet-4-6)
    openclaw models set anthropic/claude-sonnet-4-6
    ;;
  gemini|gemini-pro)
    openclaw models set openrouter/google/gemini-pro
    ;;
  help|*)
    echo "Usage: toggle-model.sh {oss|sonnet|gemini|help}"
    exit 1
    ;;
esac

openclaw gateway restart
echo "Switched to $1 and gateway restarted."
```

Usage:
- ./toggle-model.sh oss  # switch to GPT-OSS 20B
- ./toggle-model.sh sonnet  # switch to Claude Sonnet 4-6
- ./toggle-model.sh gemini  # switch to Gemini Pro

Runbook notes (for future reference)
- Step-by-step commands for switching models are in MODEL-SWITCHING.md and memory logs.
- Use the backup and runbook as safety rails when implementing new workflows.

If you'd prefer, I can also push a public copy of this README to the GitHub repo to make the instructions directly visible to others.