# backend.md

## Goal
manual-first な受注・proof・print 管理を壊れず回す。

## Rules
- Route Handlers / Server Actions を基本とする
- 過剰抽象化禁止
- service layer / repository pattern は必要になるまで導入しない
- status は明示的な enum 値で管理する
- proof / revision / print master は別概念として扱う
- customer access は token-based でよい
- admin auth は必須
- Storage path 規則を固定する
- 画像生成AIパイプラインを内部実装しない

## Do not
- workflow engine を作らない
- generalized catalog / product engine を作らない
- multi-tenant を見越した設計にしない
- 今不要な queue / cron / event bus を入れない
