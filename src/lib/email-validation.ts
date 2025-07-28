// メールアドレス検証とSupabase設定診断ユーティリティ

// 複数のメールアドレス検証パターンをテスト
export const validateEmailFormats = (email: string) => {
  const tests = {
    // 基本的なRFC形式
    basic: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    
    // より厳密なRFC 5322準拠
    strict: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email),
    
    // Supabaseで一般的に受け入れられる形式
    supabaseCompatible: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
    
    // ドメイン部分の検証
    validDomain: /^[^\s@]+@[a-zA-Z0-9][a-zA-Z0-9.-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(email),
  };

  return {
    email,
    tests,
    isValid: Object.values(tests).every(result => result),
    summary: `${Object.values(tests).filter(Boolean).length}/${Object.keys(tests).length} テスト通過`
  };
};

// 推奨されるデモメールアドレスのリスト
export const generateValidDemoEmails = () => {
  const domains = [
    'gmail.com',
    'yahoo.com', 
    'outlook.com',
    'hotmail.com',
    'test.com',
    'demo.com'
  ];

  const usernames = [
    'demo',
    'demo.user',
    'test.user',
    'sample.demo',
    'tiktok.demo'
  ];

  const demoEmails = [];
  for (const username of usernames) {
    for (const domain of domains) {
      demoEmails.push(`${username}@${domain}`);
    }
  }

  return demoEmails;
};

// メールアドレスの問題を診断
export const diagnoseEmailIssue = (email: string, error: string) => {
  const validation = validateEmailFormats(email);
  
  const diagnosis = {
    email,
    error,
    validation,
    possibleCauses: [] as string[],
    recommendations: [] as string[]
  };

  // エラーメッセージに基づく診断
  if (error.includes('invalid')) {
    diagnosis.possibleCauses.push('メールアドレスの形式が無効');
    
    if (!validation.tests.basic) {
      diagnosis.recommendations.push('基本的なメール形式（user@domain.com）を使用してください');
    }
    
    if (!validation.tests.supabaseCompatible) {
      diagnosis.recommendations.push('Supabase互換形式のメールアドレスを使用してください');
    }
  }

  if (error.includes('domain')) {
    diagnosis.possibleCauses.push('ドメイン部分に問題がある可能性');
    diagnosis.recommendations.push('gmail.com、yahoo.com等の一般的なドメインを試してください');
  }

  // example.comドメインの問題
  if (email.includes('example.com')) {
    diagnosis.possibleCauses.push('example.comドメインがSupabaseで制限されている可能性');
    diagnosis.recommendations.push('gmail.com、test.com等の実際のドメインを使用してください');
  }

  // 特殊文字の問題
  if (/[<>()[\]\\.,;:\s@"]/g.test(email.split('@')[0])) {
    diagnosis.possibleCauses.push('ユーザー名部分に使用できない文字が含まれている');
    diagnosis.recommendations.push('英数字、ピリオド、ハイフン、アンダースコアのみを使用してください');
  }

  return diagnosis;
};

// 推奨デモメールアドレスを生成
export const getRecommendedDemoEmail = () => {
  const validEmails = generateValidDemoEmails();
  const recommendedEmails = validEmails.filter(email => {
    const validation = validateEmailFormats(email);
    return validation.isValid;
  });

  return {
    primary: 'demo.user@gmail.com',
    alternatives: recommendedEmails.slice(0, 5),
    all: recommendedEmails
  };
};