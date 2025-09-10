/**
 * 共通エラーハンドリングユーティリティ
 * APIエラーを分かりやすいメッセージに変換
 */

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      errors?: string[] | string;
      message?: string;
    };
  };
  message?: string;
}

/**
 * APIエラーを日本語のユーザーフレンドリーなメッセージに変換
 */
export const getErrorMessage = (error: ApiError, defaultMessage: string = 'エラーが発生しました'): string => {
  // ネットワークエラーの場合
  if (!error.response) {
    return 'ネットワーク接続に問題があります。インターネット接続を確認してください。';
  }

  const { status, data } = error.response;

  // HTTPステータスコードに基づくエラーメッセージ
  switch (status) {
    case 400:
      return '入力内容に問題があります。入力を確認してください。';
    case 401:
      return '認証が必要です。再度ログインしてください。';
    case 403:
      return 'この操作を実行する権限がありません。';
    case 404:
      return 'お探しの情報が見つかりません。';
    case 422:
      // バリデーションエラーの詳細を表示
      if (data?.errors) {
        if (Array.isArray(data.errors)) {
          return data.errors.join('、');
        }
        return String(data.errors);
      }
      return '入力内容が正しくありません。';
    case 429:
      return 'リクエストが多すぎます。しばらく時間をおいてからお試しください。';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'サーバーに問題が発生しています。しばらく時間をおいてからお試しください。';
    default:
      break;
  }

  // サーバーからのエラーメッセージを使用
  if (data?.message) {
    return data.message;
  }

  if (data?.errors) {
    if (Array.isArray(data.errors)) {
      return data.errors.join('、');
    }
    return String(data.errors);
  }

  return defaultMessage;
};

/**
 * フィールドバリデーション用の共通関数
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return 'メールアドレスを入力してください';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return '有効なメールアドレスを入力してください';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'パスワードを入力してください';
  if (password.length < 8) return 'パスワードは8文字以上で入力してください';
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return 'パスワードは英字と数字を含む必要があります';
  }
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName}を入力してください`;
  }
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return null; // 電話番号は必須ではない
  const phoneRegex = /^[0-9\-\(\)\+\s]+$/;
  if (!phoneRegex.test(phone)) return '有効な電話番号を入力してください';
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return null; // URLは必須ではない
  try {
    new URL(url);
    return null;
  } catch {
    return '有効なURLを入力してください（例: https://example.com）';
  }
};

/**
 * 複数フィールドの一括バリデーション
 */
export const validateForm = (fields: Record<string, { value: string; validators: ((value: string) => string | null)[] }>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(fields).forEach(([fieldName, { value, validators }]) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[fieldName] = error;
        break; // 最初のエラーのみ表示
      }
    }
  });

  return errors;
};