package com.readyq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.net.URL;

@SpringBootApplication
@EnableScheduling
public class ReadyQApplication {
    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(ReadyQApplication.class, args);
    }

    private static void loadDotenv() {
        File envFile = findEnvFile();
        if (envFile == null) return;

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                int idx = line.indexOf('=');
                if (idx > 0) {
                    String key = line.substring(0, idx).trim();
                    String value = line.substring(idx + 1).trim();
                    if (System.getProperty(key) == null) {
                        System.setProperty(key, value);
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static File findEnvFile() {
        // 1) 현재 working directory
        File f = new File(".env");
        if (f.exists()) return f;

        // 2) 클래스 파일 위치에서 상위 탐색
        //    IntelliJ Gradle: .../backend/build/classes/java/main
        try {
            URL location = ReadyQApplication.class.getProtectionDomain().getCodeSource().getLocation();
            File dir = new File(location.toURI());
            for (int i = 0; i < 10 && dir != null; i++) {
                File candidate = new File(dir, ".env");
                if (candidate.exists()) return candidate;
                dir = dir.getParentFile();
            }
        } catch (Exception ignored) {
        }

        return null;
    }
}
