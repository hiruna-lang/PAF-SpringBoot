package backend.Module_2.Booking.dto;

import java.util.List;
import java.util.Map;

public class BookingAnalyticsResponse {

    private long totalBookings;
    private long pendingCount;
    private long approvedTodayCount;
    private Map<String, Long> statusBreakdown;
    private List<TopResource> topResources;

    public static class TopResource {
        private String resourceId;
        private String resourceName;
        private long bookingCount;

        public TopResource(String resourceId, String resourceName, long bookingCount) {
            this.resourceId = resourceId;
            this.resourceName = resourceName;
            this.bookingCount = bookingCount;
        }

        public String getResourceId() { return resourceId; }
        public String getResourceName() { return resourceName; }
        public long getBookingCount() { return bookingCount; }
    }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public long getPendingCount() { return pendingCount; }
    public void setPendingCount(long pendingCount) { this.pendingCount = pendingCount; }

    public long getApprovedTodayCount() { return approvedTodayCount; }
    public void setApprovedTodayCount(long approvedTodayCount) { this.approvedTodayCount = approvedTodayCount; }

    public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }

    public List<TopResource> getTopResources() { return topResources; }
    public void setTopResources(List<TopResource> topResources) { this.topResources = topResources; }
}
