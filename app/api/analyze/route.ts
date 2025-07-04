import { NextResponse } from 'next/server';

// Python AIサーバーのエンドポイント（環境変数から取得）
const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000/analyze';

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
    const value = formData.get('value') as string | null;
    const rect = formData.get('rect') as string | null;

    // デバッグ用ログ
    console.log('受信データ:', { file: file?.name, scene, mode, value, rect });

    // 必須フィールドのバリデーション
    if (!file || !scene || !mode) {
      console.error('必須フィールドが不足:', { file: !!file, scene, mode });
      return new NextResponse('必須フィールドが不足: file, scene, または mode', { status: 400 });
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