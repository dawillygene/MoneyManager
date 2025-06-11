package com.example.moneymanager.controllers;

import com.example.moneymanager.services.ReportService;
import com.example.moneymanager.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    // Core Report Endpoints
    @GetMapping("/expense-analysis")
    public ResponseEntity<?> getExpenseAnalysis(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "true") boolean includeSubcategories,
            @RequestParam(defaultValue = "TZS") String currency,
            @RequestParam(defaultValue = "category") String groupBy) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> analysis = reportService.getExpenseAnalysis(
                userId, period, startDate, endDate, includeSubcategories, currency, groupBy);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate expense analysis: " + e.getMessage(), "EXPENSE_ANALYSIS_FAILED");
        }
    }

    @GetMapping("/income-vs-expenses")
    public ResponseEntity<?> getIncomeVsExpenses(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "true") boolean includeProjections,
            @RequestParam(defaultValue = "month") String groupBy) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> comparison = reportService.getIncomeVsExpenses(
                userId, period, startDate, endDate, includeProjections, groupBy);
            return ResponseEntity.ok(comparison);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate income vs expenses report: " + e.getMessage(), "INCOME_EXPENSES_FAILED");
        }
    }

    @GetMapping("/budget-performance")
    public ResponseEntity<?> getBudgetPerformance(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "true") boolean includeForecasts) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> performance = reportService.getBudgetPerformance(
                userId, period, startDate, endDate, includeForecasts);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate budget performance report: " + e.getMessage(), "BUDGET_PERFORMANCE_FAILED");
        }
    }

    @GetMapping("/savings-analysis")
    public ResponseEntity<?> getSavingsAnalysis(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "true") boolean includeGoals,
            @RequestParam(defaultValue = "true") boolean includeRecommendations) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> analysis = reportService.getSavingsAnalysis(
                userId, period, startDate, endDate, includeGoals, includeRecommendations);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate savings analysis: " + e.getMessage(), "SAVINGS_ANALYSIS_FAILED");
        }
    }

    // Report Generation and Management
    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody Map<String, Object> reportRequest) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> result = reportService.generateReport(userId, reportRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return createErrorResponse("Failed to start report generation: " + e.getMessage(), "REPORT_GENERATION_FAILED");
        }
    }

    @GetMapping("/status/{reportId}")
    public ResponseEntity<?> getReportStatus(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String reportId) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> status = reportService.getReportStatus(userId, reportId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return createErrorResponse("Failed to get report status: " + e.getMessage(), "REPORT_STATUS_FAILED");
        }
    }

    @GetMapping("/download/{reportId}")
    public ResponseEntity<?> downloadReport(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String reportId,
            @RequestParam(required = false) String format) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> result = reportService.downloadReport(userId, reportId, format);
            
            byte[] fileData = (byte[]) result.get("fileData");
            String fileName = (String) result.get("fileName");
            String contentType = (String) result.get("contentType");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setContentLength(fileData.length);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(fileData);
        } catch (Exception e) {
            return createErrorResponse("Failed to download report: " + e.getMessage(), "REPORT_DOWNLOAD_FAILED");
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getReportsList(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String status) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> reports = reportService.getReportsList(
                userId, page, limit, sortBy, sortOrder, reportType, format, status);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return createErrorResponse("Failed to retrieve reports list: " + e.getMessage(), "REPORTS_LIST_FAILED");
        }
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String reportId) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> result = reportService.deleteReport(userId, reportId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return createErrorResponse("Failed to delete report: " + e.getMessage(), "REPORT_DELETE_FAILED");
        }
    }

    // Export Endpoints
    @GetMapping("/export/csv")
    public ResponseEntity<?> exportCSV(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String categories) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> result = reportService.exportCSV(
                userId, type, period, startDate, endDate, categories);
            
            byte[] csvData = (byte[]) result.get("csvData");
            String fileName = (String) result.get("fileName");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setContentLength(csvData.length);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
        } catch (Exception e) {
            return createErrorResponse("Failed to export CSV: " + e.getMessage(), "CSV_EXPORT_FAILED");
        }
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<?> exportPDF(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "monthly") String template,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "true") boolean includeCharts,
            @RequestParam(required = false) String sections) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> result = reportService.exportPDF(
                userId, template, period, startDate, endDate, includeCharts, sections);
            
            byte[] pdfData = (byte[]) result.get("pdfData");
            String fileName = (String) result.get("fileName");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/pdf"));
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setContentLength(pdfData.length);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfData);
        } catch (Exception e) {
            return createErrorResponse("Failed to export PDF: " + e.getMessage(), "PDF_EXPORT_FAILED");
        }
    }

    // Advanced Analytics
    @GetMapping("/financial-health")
    public ResponseEntity<?> getFinancialHealth(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "last-6-months") String period,
            @RequestParam(defaultValue = "true") boolean includeRecommendations) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> health = reportService.getFinancialHealth(
                userId, period, includeRecommendations);
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate financial health report: " + e.getMessage(), "FINANCIAL_HEALTH_FAILED");
        }
    }

    @GetMapping("/cash-flow")
    public ResponseEntity<?> getCashFlow(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "last-6-months") String period,
            @RequestParam(defaultValue = "true") boolean includeProjections,
            @RequestParam(defaultValue = "3") int projectionMonths) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> cashFlow = reportService.getCashFlow(
                userId, period, includeProjections, projectionMonths);
            return ResponseEntity.ok(cashFlow);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate cash flow analysis: " + e.getMessage(), "CASH_FLOW_FAILED");
        }
    }

    // Legacy endpoints (keeping for backward compatibility)
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyReport(@RequestHeader("Authorization") String authorizationHeader,
                                            @RequestParam int year,
                                            @RequestParam int month) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> report = reportService.getMonthlyReport(userId, year, month);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate monthly report: " + e.getMessage(), "MONTHLY_REPORT_FAILED");
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
            return createErrorResponse("Failed to generate yearly report: " + e.getMessage(), "YEARLY_REPORT_FAILED");
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
            return createErrorResponse("Failed to generate custom report: " + e.getMessage(), "CUSTOM_REPORT_FAILED");
        }
    }

    @GetMapping("/savings-report")
    public ResponseEntity<?> getSavingsReport(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(defaultValue = "this-month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            Map<String, Object> savingsReport = reportService.getSavingsAnalysis(userId, period, startDate, endDate, true, true);
            return ResponseEntity.ok(savingsReport);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate savings report: " + e.getMessage(), "SAVINGS_REPORT_FAILED");
        }
    }

    @PostMapping("/export")
    public ResponseEntity<?> exportReportPost(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody Map<String, Object> exportRequest) {
        try {
            Long userId = getUserIdFromToken(authorizationHeader);
            
            // Get export parameters
            String format = (String) exportRequest.getOrDefault("format", "PDF");
            String reportType = (String) exportRequest.getOrDefault("reportType", "comprehensive");
            String period = (String) exportRequest.getOrDefault("period", "this-month");
            
            // Generate report data based on type
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("title", "Financial Report - " + reportType);
            reportData.put("period", period);
            reportData.put("generatedDate", java.time.LocalDateTime.now().toString());
            reportData.put("format", format);
            reportData.put("userId", userId);
            
            // Add different data based on report type
            switch (reportType.toLowerCase()) {
                case "savings":
                    reportData.put("data", reportService.getSavingsAnalysis(userId, period, null, null, true, true));
                    break;
                case "budget":
                    reportData.put("data", reportService.getBudgetPerformance(userId, period, null, null, true));
                    break;
                case "income-expenses":
                    reportData.put("data", reportService.getIncomeVsExpenses(userId, period, null, null, true, "month"));
                    break;
                case "comprehensive":
                default:
                    // Get comprehensive data
                    Map<String, Object> comprehensiveData = new HashMap<>();
                    comprehensiveData.put("savings", reportService.getSavingsAnalysis(userId, period, null, null, true, true));
                    comprehensiveData.put("budget", reportService.getBudgetPerformance(userId, period, null, null, true));
                    comprehensiveData.put("incomeExpenses", reportService.getIncomeVsExpenses(userId, period, null, null, true, "month"));
                    reportData.put("data", comprehensiveData);
                    break;
            }
            
            return ResponseEntity.ok(reportData);
        } catch (Exception e) {
            return createErrorResponse("Failed to export report: " + e.getMessage(), "REPORT_EXPORT_FAILED");
        }
    }

    private ResponseEntity<?> createErrorResponse(String message, String code) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", true);
        errorResponse.put("message", message);
        errorResponse.put("code", code);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}