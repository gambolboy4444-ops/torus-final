# 🛰️ TORUS - Satellite UI Node
**"The Visual Interface for Direct Protocol V12.4"**

このリポジトリは、TORUSプロジェクトの「顔」となる**UI側（フロントエンド）**のソースコードを格納しています。

## 🎯 UI側の役割
- **Visual Telemetry**: Core側（バックエンド）から受信した数値（current_count）をリアルタイムに画面へ反映。
- **Pulse Emission**: 「BURST」および「SINGLE PULSE」ボタンによる、Core側への信号射出。
- **Status Monitoring**: Core側との接続状態（STABLE/OFFLINE）の可視化。

## 🔗 通信先（Core側）
- **Genesis Core Endpoint**: `https://torus-genesis-core.vercel.app`
