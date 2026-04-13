package com.sognodicasa.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 設定
 * 讓 /uploads/ 路徑可以存取本機 uploads 資料夾裡的圖片
 *
 * 例如：http://localhost:8080/uploads/1234567890_abc12345.jpg
 * → 對應到 ./uploads/1234567890_abc12345.jpg（後端執行目錄下）
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/** → 本機 uploads 資料夾
        // "file:" 前綴代表本機檔案系統路徑
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
