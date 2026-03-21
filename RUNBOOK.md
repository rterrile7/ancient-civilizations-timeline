# Ancient Civilizations Timeline - RUNBOOK

## Master Template: Port 8061 (Feb 28, 2026)
Backup: ~/ancient_civilizations/visualization-MASTER-8061/

---

## How to Start the Server
```
cd ~/ancient_civilizations/visualization
python3 -m http.server 8061
```
Then open: http://localhost:8061

---

## THE GOLDEN RULE
### ✅ To add civilizations: ONLY edit data/civilizations.json via Python
### ❌ NEVER hand-edit the JSON
### ❌ NEVER touch index.html, css/styles.css, or js/timeline.js unless fixing a named bug

---

## How to Add Civilizations (Safe Method)
```python
python3 << 'PYEOF'
import json

with open('/Users/richterrile/ancient_civilizations/visualization/data/civilizations.json', 'r') as f:
    data = json.load(f)

new_civs = [
    {
        "name": "Civilization Name",
        "region": "One of the 8 regions below",
        "period": {
            "start": { "year": -500, "confidence": "high", "note": "Founding event" },
            "end":   { "year": -100, "confidence": "medium", "note": "Ending event" }
        },
        "location": { "region": "Geographic area", "modern": "Modern country names" },
        "key_developments": [
            { "year": -400, "confidence": "high", "event": "Event name", "significance": "Why it matters" }
        ],
        "connections": [
            { "civilization": "Exact name of another civ", "type": "trade", "details": "Description" }
        ]
    }
]

data['civilizations'].extend(new_civs)

with open('/Users/richterrile/ancient_civilizations/visualization/data/civilizations.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Total civilizations: {len(data['civilizations'])}")
PYEOF
```

---

## The 8 Regions (use exactly these strings)
- Mesopotamia
- Egypt & North Africa
- Levant & Arabia
- Anatolia & Persia
- Europe & Mediterranean
- Africa & Horn
- Asia
- Americas

## Valid Connection Types
- trade
- cultural_exchange
- conquest
- succession
- cultural_inheritance
- cultural_absorption
- conflict

## Valid Confidence Levels
- high
- medium
- low

---

## How to Restore from Master Backup
```
cp -r ~/ancient_civilizations/visualization-MASTER-8061 ~/ancient_civilizations/visualization-restored
cd ~/ancient_civilizations/visualization-restored
python3 -m http.server 8099
```

---

## Current Features (Feb 28, 2026)
- 70 civilizations spanning 4500 BCE – 1100 CE
- 8 geographic region groups with color-coded headers
- Unique color per civilization
- Confidence indicators (green/yellow/red caps) on both bar ends
- Hover: date labels outside bars + details panel below
- Zoom In/Out buttons + Ctrl+scroll mouse wheel zoom
- Horizontal scrolling for full timeline
- Vertical scroll sync between names column and timeline
- Connection lines (color+dash coded by type) drawn behind bars
- Details panel shows region, period, location, developments, connections

---

## Planned Next Features
1. Filter/Compare: select civilizations to highlight; fade others
2. Collapsible region groups
3. Map overlay with time slider showing territorial extent
4. Globe view (3D)
5. Key people and events as point markers
6. Trade route overlays

