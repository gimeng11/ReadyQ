package com.readyq.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuthRedirectCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (request.getRequestURI().contains("/oauth2/authorization")) { //startsWith 대신 contains
            String appRedirect = request.getParameter("app_redirect");
            
            //테스트 로그
            System.out.println("OAuth Filter Catch! app_redirect: " + appRedirect);
            
            if (appRedirect != null && !appRedirect.isEmpty()) {
                Cookie cookie = new Cookie("oauth2_app_redirect",
                        URLEncoder.encode(appRedirect, StandardCharsets.UTF_8));
                cookie.setPath("/");
                cookie.setHttpOnly(false); //expo테스트 false로변경
                cookie.setMaxAge(300); // 5분
                response.addCookie(cookie);
            }
        }
        filterChain.doFilter(request, response);
    }
}
