# DSH Image Input Specification

## Scope

The Claude plugin accepts ordered text and image content from the latest direct
DSH user message. Image input is supported by the default Claude Agent SDK
backend. The CLI backend is text-only and must reject image input explicitly.

## Input contract

The adapter must preserve the order of text and image blocks. Before starting a
Claude turn, it must read every image through the authoritative DSH
`attachments` service. That read verifies the durable reference, stored bytes,
and media type. Supported media types are PNG, JPEG, GIF, and WebP.

The adapter must not pass attachment paths or references to Claude. It converts
verified bytes to base64 and sends one Claude SDK user message whose content
contains ordered Anthropic text and image blocks. Pure text messages retain the
existing string-prompt path.

Missing, corrupt, invalid, or unsupported attachments must fail before the
Claude model request starts. Errors must identify the attachment and explain
whether storage is unavailable, the media type is unsupported, or stored data
cannot be read. Cancellation during attachment reading must remain a
cancellation and must not start a model request.

## Capability contract

Models exposed by the active SDK backend advertise `text` and `image` input.
Models exposed after a CLI fallback advertise `text` only. Capability metadata
must describe the active backend and must never promise an input that backend
will silently discard.

## Verification contract

Delivery requires all of the following:

1. Adapter tests for a new Session and a continued Session with one image and
   text.
2. An adapter test proving multiple images and interleaved text preserve exact
   content order.
3. An SDK client test proving the query receives an async SDK user message with
   ordered Anthropic base64 image and text blocks.
4. Separate negative tests for unavailable storage, missing bytes, corrupt bytes,
   unsupported media, invalid stored data, and cancellation. No failed case may
   call the Claude runtime or SDK query.
5. Capability and CLI tests proving SDK models advertise image support, CLI
   models do not, and CLI image input is rejected.
6. A real official DSH Web E2E test uploads a fixed known image in a new Claude
   Session, obtains an image-grounded description, then uploads another image
   after continuation. The evidence records DSH version, plugin commit, image
   fixture digest, exported Session attachment records, and the two model
   responses.
