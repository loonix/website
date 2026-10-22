# Privacy Policy, Crabsapp

Last updated: 22 October 2026

Crabsapp (`com.opencrabs.mi8crab`) is a client for an agent that runs on your own
device. It is not a hosted service and it has no server of its own.

## What the app stores on your device

Everything the app knows lives in the app's private storage on the phone:

- the conversations, written by the local agent binary into its own SQLite
  database inside the app's private directory;
- the app's preferences: selected model and provider, voice settings, the
  optional API key you type in for spoken summaries, and the ElevenLabs key if
  you enter one;
- no analytics, no crash reporting, no advertising identifier, no device
  fingerprint.

Uninstalling the app deletes all of it. There is no backup to restore from,
because there is no server holding a copy.

## What leaves the device, and when

The app itself makes exactly one kind of outbound request: the optional spoken
summary. When you ask for a spoken answer, the text of that answer is sent to
the summariser endpoint you configured, together with the API key you entered,
to shorten it before it is read aloud. If you never use the spoken summary, the
app makes no outbound request of its own.

The agent binary may contact the model provider you configured. That traffic is
between you and that provider, under their terms and their privacy policy, and
it carries the prompt you sent plus the conversation context the model needs.

The app contains no third-party analytics, tracking or advertising SDK. Its only
dependencies are Flutter's own libraries and the Cupertino icon font.

## Permissions, and why each one exists

| Permission | Why |
|---|---|
| `INTERNET` | the spoken summary request, and the agent's calls to your model provider |
| `RECORD_AUDIO` | dictation through the system speech recogniser; requested at the moment you tap the microphone, never at launch |
| `POST_NOTIFICATIONS` | the ongoing notification that keeps the agent alive |
| `FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_SPECIAL_USE` | a long-lived agent connection that must survive the app being backgrounded |
| `RECEIVE_BOOT_COMPLETED` | bringing the agent back after a reboot |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | optional; without it the system may kill the agent mid-turn |

## Root

Crabsapp is built for a rooted device and asks for superuser access through
Magisk or an equivalent manager. It uses that access to run the agent binary
inside a Linux chroot on the phone. It does not use root to read other apps'
data, and it does not touch anything outside its own chroot and the app's
private directory.

## Children

The app is a developer tool. It is not directed at children and collects no
personal information from anyone.

## Changes

If this policy changes, the new version is published at this address with a new
date.

## Contact

Daniel Carneiro, daniel@objais.com
