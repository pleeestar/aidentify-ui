// path: /app/api/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Python AIサーバーのエンドポイント
const AI_SERVER_URL = 'https://rein0421-aidentify.hf.space/analyze';
// デバッグ用のダミーレスポンスを有効化するかどうか
const USE_DUMMY_RESPONSE = false;
// テスト用のダミーレスポンスの種類
const DUMMY_RESPONSE_TYPE: 'random' | 'fixed' | 'error' = 'random';

// API ルートの設定
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // API ルートのボディサイズ制限を 10MB に設定
    },
  },
};

export async function POST(request: Request) {
  try {
    // リクエストからFormDataを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const scene = formData.get('scene') as string;
    const mode = formData.get('mode') as string;
    const risk_level = formData.get('risk_level') as string | null;
    const rect = formData.get('rect') as string | null;

    // デバッグ用ログ
    console.log('受信データ:', { file: file?.name, scene, mode, risk_level, rect });

    // 必須フィールドのバリデーション
    if (!file || !scene || !mode) {
      console.error('必須フィールドが不足:', { file: !!file, scene, mode });
      return new NextResponse('必須フィールドが不足: file, scene, または mode', { status: 400 });
    }

    // デバッグモード（ダミーレスポンス）が有効な場合
    if (USE_DUMMY_RESPONSE) {
      console.log(`デバッグモード: ダミーレスポンスを使用 (タイプ: ${DUMMY_RESPONSE_TYPE})`);

      // テスト用ダミーレスポンスのロジック
      switch (DUMMY_RESPONSE_TYPE) {
        case 'fixed':
          // 固定値のダミーレスポンス（テスト用: 危険度50）
          return new NextResponse(new Blob(['fixed dummy image content'], { type: 'image/jpeg' }), {
            headers: {
              'Content-Type': 'image/jpeg',
              'x-danger': '50',
            },
          });

        case 'error':
          // エラーシナリオのダミーレスポンス（テスト用: 400エラー）
          return new NextResponse('テスト用エラー: 無効なリクエスト', { status: 400 });

        case 'random':
        default:
          // ランダムな危険度のダミーレスポンス（デフォルト）
          const dummyImage = new Blob(['random dummy image content'], { type: 'image/jpeg' });
          const danger = Math.floor(Math.random() * 100);
          return new NextResponse(dummyImage, {
            headers: {
              'Content-Type': 'image/jpeg',
              'x-danger': danger.toString(),
            },
          });
      }
    }

    // Python AIサーバーにリクエストを転送
    const aiResponse = await fetch(AI_SERVER_URL, {
      method: 'POST',
      body: formData, // FormDataをそのまま転送
      headers: {
        // FormDataを使用する場合、Content-Typeは自動設定されるため明示的に設定しない
      },
    });

    // レスポンスの確認
    if (!aiResponse.ok) {
      console.error('AIサーバーエラー:', {
        status: aiResponse.status,
        statusText: aiResponse.statusText,
      });
      return new NextResponse(`AIサーバーエラー: ${aiResponse.statusText}`, { status: aiResponse.status });
    }

    // AIサーバーからのレスポンスを取得
    const blob = await aiResponse.blob();
    const danger = aiResponse.headers.get('x-danger') || '0';

    // デバッグ用ログ
    console.log('AIサーバーレスポンス:', { blobType: blob.type, danger });

    // クライアントにレスポンスを返す
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type || 'image/jpeg',
        'x-danger': danger,
      },
    });
  } catch (error) {
    console.error('リクエスト処理エラー:', error);
    return new NextResponse('内部サーバーエラー', { status: 500 });
  }
}