# Model Switching Runbook
© 2026 Dr. Richard J. Terrile

## Quick Reference

### Switch to FREE local model (GPT-OSS 20B)
```
openclaw models set ollama/gpt-oss:20b
openclaw gateway restart
```
- Cost: FREE (runs locally on Mac Mini)
- Good for: routine tasks, data additions, simple questions, heartbeats
- Limitations: slower, less creative, may struggle with complex code

### Switch to HIGH-END model (Claude Sonnet 4-6)
```
openclaw models set openrouter/anthropic/claude-sonnet-4-6
openclaw gateway restart
```
- Cost: ~$3/input MTok, $15/output MTok via OpenRouter
- Good for: complex coding, visualization work, creative tasks, research

### Verify current model
```
openclaw models status
```
Look for the "Default" line.

## When to use which

| Task | Recommended Model |
|------|------------------|
| Chatting, simple questions | GPT-OSS 20B (free) |
| Adding civilizations to JSON | GPT-OSS 20B (free) |
| Heartbeats, routine checks | GPT-OSS 20B (free) |
| Complex D3.js/code changes | Sonnet 4-6 (paid) |
| Research & analysis | Sonnet 4-6 (paid) |
| Creative writing | Sonnet 4-6 (paid) |
| Tailscale/config setup | Either works |

## Troubleshooting
- If gateway restart fails, try:
  ```
  openclaw gateway stop
  openclaw gateway start
  ```
- If model seems wrong after restart, verify with:
  ```
  openclaw models status
  ```
- To check available local models:
  ```
  ollama list
  ```
