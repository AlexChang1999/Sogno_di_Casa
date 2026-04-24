package com.sognodicasa.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Email 發送服務
 * 負責發送驗證碼信件
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:FORMA 家具 <noreply@forma.com>}")
    private String fromAddress;

    /**
     * 發送驗證碼信件
     * @param toEmail 收件人 Email
     * @param code    6 位數驗證碼
     */
    public void sendVerificationCode(String toEmail, String code) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("【FORMA】會員註冊驗證碼");
            helper.setText(buildHtmlContent(code), true); // true = HTML 格式

            mailSender.send(msg);
        } catch (MessagingException e) {
            throw new RuntimeException("驗證碼發送失敗，請稍後再試：" + e.getMessage());
        }
    }

    /** 建立驗證碼 Email 的 HTML 內容 */
    private String buildHtmlContent(String code) {
        return """
            <div style="font-family:'Helvetica Neue',Arial,sans-serif; max-width:480px; margin:0 auto; padding:40px 20px; background:#faf9f7;">
              <div style="text-align:center; margin-bottom:32px;">
                <h1 style="font-family:Georgia,serif; font-size:28px; letter-spacing:0.2em; color:#1a1a1a; font-weight:300;">FORMA</h1>
                <p style="font-size:11px; letter-spacing:0.15em; color:#999; text-transform:uppercase;">Sogno di Casa</p>
              </div>
              <div style="background:#fff; border:1px solid #e8e4de; padding:36px; text-align:center;">
                <p style="color:#555; font-size:14px; margin-bottom:8px;">您好，感謝您加入 FORMA 會員</p>
                <p style="color:#555; font-size:14px; margin-bottom:28px;">請在 <strong>10 分鐘內</strong>完成驗證</p>
                <div style="display:inline-block; background:#1a1a1a; color:#fff; padding:18px 40px; letter-spacing:0.3em; font-size:28px; font-weight:300;">
                  %s
                </div>
                <p style="color:#999; font-size:12px; margin-top:24px;">若非本人操作，請忽略此封信</p>
              </div>
              <p style="text-align:center; color:#bbb; font-size:11px; margin-top:24px;">© 2025 FORMA. All rights reserved.</p>
            </div>
            """.formatted(code);
    }
}
