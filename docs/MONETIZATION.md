# Aevanor Solitaire — Monetization Decision (locked)

**Status:** locked Jul 2026  
**Principle:** stay ad-free; never sell “remove ads” as the premium story.

## Decision

| Layer | Choice |
|---|---|
| Core play | **Forever free and ad-free** (all seven variants, undo, hint, daily, local stats, offline PWA, Win9x UI). |
| When traffic justifies revenue | **Paid extras**, not ad removal. |
| Ads | **Do not ship AdSense / interstitial ads** on aevanor.com unless this doc is explicitly revised. |

## Paid extras (v1 candidate when ready)

1. **Cloud sync + daily leaderboard** — cross-device saves/stats (Supabase already sketched)
2. **Extra themes / card decks** beyond launch art
3. **Native app** (optional later) with store billing for the same extras

Suggested packaging: **Aevanor Plus** (monthly/annual) — sync, leaderboard, extra decks. No coins, no energy, no paywalled hints.

## What we will not do

- Interrupt mid-game with ads
- Degrade free play so users “need” premium to enjoy the game
- Real-money gambling framing beyond classic Vegas *scoring* mode

## Trigger to implement billing

Ship monetization only after stable organic/direct traffic and daily retention, and after cloud sync is reliable enough that paying for it feels fair.

Until then: grow via craft, SEO landings, PWA install, and shareable dailies.

## Rationale

Competitors monetize via ads, then sell ad removal. Aevanor already gives away the calm experience as brand. Charge for *continuity and cosmetics*, not for peace.
