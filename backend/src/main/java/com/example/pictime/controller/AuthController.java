package com.example.pictime.controller;

import com.example.pictime.entity.User;
import com.example.pictime.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        // TODO: 認証・JWT発行処理
        return "{\"token\":\"dummy-jwt\"}";
    }
}
