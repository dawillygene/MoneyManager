package com.example.moneymanager.controllers;

import com.example.moneymanager.services.ReportService;
import com.example.moneymanager.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class ReportController {
    @Autowired
    private ReportService reportService;

    @Autowired
    private JwtService jwtService;

    private Long getUserIdFromToken(String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        return Long.parseLong(jwtService.extractClaims(token).get("userId").toString());
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyReport(@RequestHeader("Authorization") String authorizationHeader,
                                            @RequestParam int year,
                                            @RequestParam int month) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> report = reportService.getMonthlyReport(userId, year, month);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to generate monthly report");
            errorResponse.put("code", "MONTHLY_REPORT_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyReport(@RequestHeader("Authorization") String authorizationHeader,
                                           @RequestParam int year) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> report = reportService.getYearlyReport(userId, year);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to generate yearly report");
            errorResponse.put("code", "YEARLY_REPORT_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/custom")
    public ResponseEntity<?> getCustomReport(@RequestHeader("Authorization") String authorizationHeader,
                                           @RequestParam String startDate,
                                           @RequestParam String endDate) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> report = reportService.getCustomReport(userId, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to generate custom report");
            errorResponse.put("code", "CUSTOM_REPORT_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/export")
    public ResponseEntity<?> exportReport(@RequestHeader("Authorization") String authorizationHeader,
                                        @RequestParam String type,
                                        @RequestParam(required = false) Integer year,
                                        @RequestParam(required = false) Integer month,
                                        @RequestParam(required = false) String startDate,
                                        @RequestParam(required = false) String endDate) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> exportData = reportService.exportReport(userId, type, year, month, startDate, endDate);
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "Failed to export report");
            errorResponse.put("code", "REPORT_EXPORT_FAILED");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}