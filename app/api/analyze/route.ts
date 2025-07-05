import { NextResponse } from 'next/server';

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

    // デバッグ用ログ（受信データ）
    console.log('受信データ:', { file: file?.name, scene, mode, risk_level, rect });

    // 必須フィールドのバリデーション
    if (!file || !scene || !mode) {
      console.error('必須フィールドが不足:', { file: !!file, scene, mode });
      return new NextResponse('必須フィールドが不足: file, scene, または mode', { status: 400 });
    }

    // rectをパースしてx1, y1, x2, y2を抽出
    let x1 = '0';
    let y1 = '0';
    let x2 = '0';
    let y2 = '0';
    if (rect) {
      try {
        const rectObj = JSON.parse(rect);
        x1 = rectObj.x1?.toString() || '0';
        y1 = rectObj.y1?.toString() || '0';
        x2 = rectObj.x2?.toString() || '0';
        y2 = rectObj.y2?.toString() || '0';
      } catch (e) {
        console.error('rectのパースエラー:', e);
        return new NextResponse('無効なrectフォーマット', { status: 400 });
      }
    }

    // 新しい FormData を作成して、Pythonサーバーに必要なフィールドのみ含める
    const newFormData = new FormData();
    newFormData.append('image', file);
    newFormData.append('risk_level', risk_level || '50');
    newFormData.append('x1', x1);
    newFormData.append('y1', y1);
    newFormData.append('x2', x2);
    newFormData.append('y2', y2);

    // 送信データのログ出力
    console.log('送信データ:', {
      file: file?.name,
      risk_level: risk_level || '50',
      x1,
      y1,
      x2,
      y2,
    });

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
      body: newFormData,
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