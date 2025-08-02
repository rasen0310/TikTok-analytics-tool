import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Button,
} from '@mui/material';
import {
  Security as SecurityIcon,
  ContactMail as ContactIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* 戻るボタン */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{
              color: '#FE2C55',
              '&:hover': {
                backgroundColor: 'rgba(254, 44, 85, 0.04)',
              },
            }}
          >
            戻る
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#FE2C55' }}>
            プライバシーポリシー
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            TikTok分析ツール
          </Typography>
        </Box>

        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            本プライバシーポリシー（以下「本ポリシー」）は、当社（以下「当社」）が提供する TikTok 分析ツール（以下「本サービス」）において取得・利用するユーザー情報の取り扱い方針を定めるものです。ご利用にあたっては、本ポリシーをご確認のうえ同意してください。
          </Typography>
        </Paper>

        {/* 1. 収集する情報 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            1. 収集する情報
          </Typography>
          
          <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>区分</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>詳細</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>取得方法</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>基本アカウント情報</TableCell>
                  <TableCell>TikTok ID、ユーザー名、アイコン画像</TableCell>
                  <TableCell>TikTok OAuth（Login Kit）経由</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>動画パフォーマンスデータ</TableCell>
                  <TableCell>再生数・いいね数・コメント数・視聴維持率など</TableCell>
                  <TableCell>TikTok Display/Business API</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>閲覧・操作ログ</TableCell>
                  <TableCell>ダッシュボード閲覧履歴、クリックイベント、IP アドレス、ブラウザ情報</TableCell>
                  <TableCell>サービス利用時に自動取得</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>お問い合わせ情報</TableCell>
                  <TableCell>氏名、メールアドレス、通信内容</TableCell>
                  <TableCell>フォーム送信時に取得</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'medium' }}>Cookie・類似技術</TableCell>
                  <TableCell>セッション維持、アクセス解析（Google Analytics 等）</TableCell>
                  <TableCell>ブラウザ経由で取得</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>※ 重要:</strong> TikTok のパスワードは当社では一切取得・保存しません。OAuth により発行されるアクセストークンのみ暗号化して保管します。
            </Typography>
          </Alert>
        </Paper>

        {/* 2. 利用目的 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            2. 利用目的
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="本サービスの提供・運営・機能改善" />
            </ListItem>
            <ListItem>
              <ListItemText primary="パフォーマンス可視化・AI 分析結果の算出" />
            </ListItem>
            <ListItem>
              <ListItemText primary="障害対応・問い合わせ対応・利用規約違反の調査" />
            </ListItem>
            <ListItem>
              <ListItemText primary="新機能・重要なお知らせの通知（メール等）" />
            </ListItem>
            <ListItem>
              <ListItemText primary="統計データの作成およびマーケティング施策の効果測定" />
            </ListItem>
            <ListItem>
              <ListItemText primary="法令または利用規約で認められた範囲でのその他正当な目的" />
            </ListItem>
          </List>
        </Paper>

        {/* 3. 法的根拠 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            3. 法的根拠
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            日本の個人情報保護法
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            欧州経済領域（EEA）在住者に適用される場合は GDPR（Art. 6(1)(a)(b)(f)）に基づき、同意・契約履行・正当な利益を根拠として処理します。
          </Typography>
        </Paper>

        {/* 4. 第三者提供・外部委託 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            4. 第三者提供・外部委託
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            <strong>第三者提供：</strong>ユーザーの明示的同意がある場合、法令に基づく場合を除き行いません。
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            <strong>外部委託：</strong>AWS、Google Cloud などのクラウドインフラ事業者／分析ツール提供者に業務を委託する際は、機密保持契約を締結し安全管理措置を義務付けます。
          </Typography>
        </Paper>

        {/* 5. Cookie 等の利用 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            5. Cookie 等の利用
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            当社はサービス品質向上のため Cookie や類似技術を使用します。
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            ブラウザ設定により Cookie の無効化が可能ですが、一部機能がご利用いただけなくなる場合があります。
          </Typography>
        </Paper>

        {/* 6. データ保存期間 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            6. データ保存期間
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="TikTok アクセストークン" 
                secondary="最終利用から 30 日 経過後に自動削除" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="分析データ" 
                secondary="アカウント連携解除から 90 日以内 に削除" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="ログ・バックアップ" 
                secondary="法的義務およびトラブル調査のため最大 1 年 保存" 
              />
            </ListItem>
          </List>
        </Paper>

        {/* 7. 情報セキュリティ */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            7. 情報セキュリティ
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="TLS 1.2 以上による通信暗号化" />
            </ListItem>
            <ListItem>
              <ListItemText primary="アクセストークン・個人データの暗号化保管 (AES-256)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="アクセス権限管理・多要素認証・定期的な脆弱性診断" />
            </ListItem>
            <ListItem>
              <ListItemText primary="社員・委託先への個人情報保護研修" />
            </ListItem>
          </List>
        </Paper>

        {/* 8. ユーザーの権利 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            8. ユーザーの権利
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            ご本人は、適用法令の範囲で以下を請求できます。
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="開示・訂正・削除" />
            </ListItem>
            <ListItem>
              <ListItemText primary="利用停止・消去" />
            </ListItem>
            <ListItem>
              <ListItemText primary="データポータビリティ（GDPR 適用時）" />
            </ListItem>
            <ListItem>
              <ListItemText primary="処理への異議申立て・同意撤回" />
            </ListItem>
          </List>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
            手続き方法は「11. お問い合わせ先」へご連絡ください。
          </Typography>
        </Paper>

        {/* 9. 未成年のプライバシー */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            9. 未成年のプライバシー
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            16 歳未満の方は、保護者の同意を得たうえでご利用ください。保護者からの削除依頼があった場合は速やかに対応します。
          </Typography>
        </Paper>

        {/* 10. ポリシーの改定 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            10. ポリシーの改定
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            法令改正・サービス変更等に応じて本ポリシーを改定することがあります。重要な変更がある場合は Web サイト上で事前に告知します。
          </Typography>
        </Paper>

        {/* 11. お問い合わせ先 */}
        <Paper sx={{ p: 4, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            <ContactIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            11. お問い合わせ先
          </Typography>
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'white', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0' 
          }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>運営会社：</strong>合同会社RASEN
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>個人情報保護管理責任者：</strong>媚山 遼太
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>所在地：</strong>〒399‑0007 長野県松本市石芝 3‑7‑6
            </Typography>
            <Typography variant="body1">
              <strong>連絡先メールアドレス：</strong>
              <a href="mailto:kobiyamaryota@gmail.com" style={{ color: '#FE2C55', textDecoration: 'none' }}>
                kobiyamaryota@gmail.com
              </a>
            </Typography>
          </Box>
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* 同意文 */}
        <Paper sx={{ p: 4, backgroundColor: '#fef7f0', border: '2px solid #FE2C55' }}>
          <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'medium', lineHeight: 1.8 }}>
            本サービスをご利用いただくことで、本ポリシーに記載された内容に同意いただいたものとみなします。
          </Typography>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="textSecondary">
            最終更新日：2025年1月（制定）
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};