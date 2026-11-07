# GitHub-Pages-Stammdateien

Diese Dateien gehören in das separate öffentliche Repository
`123456677776578656/123456677776578656.github.io`.

1. In der Play Console unter **App-Integrität > App-Signierung** den SHA-256-Fingerabdruck des App-Signierungsschlüssels kopieren.
2. Den Platzhalter in `.well-known/assetlinks.json.example` ersetzen.
3. Die Datei in `.well-known/assetlinks.json` umbenennen.
4. `_config.yml` und `.well-known/assetlinks.json` auf den GitHub-Pages-Branch veröffentlichen.
5. Prüfen, dass `https://123456677776578656.github.io/.well-known/assetlinks.json` direkt JSON mit HTTP 200 liefert.
