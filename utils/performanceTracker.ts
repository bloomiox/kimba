import type { Hairstylist, Sale, Appointment, Service, HairstylistPerformance } from '../types';

export class PerformanceTracker {
  /**
   * Calculate performance metrics for a hairstylist for a given month
   */
  static calculateMonthlyPerformance(
    hairstylist: Hairstylist,
    sales: Sale[],
    appointments: Appointment[],
    services: Service[],
    month: string // YYYY-MM format
  ): HairstylistPerformance {
    const monthStart = new Date(`${month}-01`);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    // Filter sales for this hairstylist and month
    const hairstylistSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return sale.hairstylistId === hairstylist.id &&
             saleDate >= monthStart &&
             saleDate <= monthEnd;
    });

    // Filter appointments for this hairstylist and month
    const hairstylistAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointment.hairstylistId === hairstylist.id &&
             appointmentDate >= monthStart &&
             appointmentDate <= monthEnd &&
             appointment.status === 'confirmed';
    });

    // Calculate total revenue
    const totalRevenue = hairstylistSales.reduce((sum, sale) => sum + sale.total, 0);

    // Calculate total appointments
    const totalAppointments = hairstylistAppointments.length;

    // Calculate average rating (placeholder - would need rating system)
    const averageRating = 4.5; // Default rating

    // Calculate commission
    const totalCommission = this.calculateCommission(hairstylist, hairstylistSales);

    // Calculate top services
    const serviceStats = new Map<string, { count: number; revenue: number; name: string }>();
    
    hairstylistSales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.type === 'service') {
          const current = serviceStats.get(item.id) || { count: 0, revenue: 0, name: item.name };
          serviceStats.set(item.id, {
            count: current.count + 1,
            revenue: current.revenue + item.price,
            name: item.name
          });
        }
      });
    });

    const topServices = Array.from(serviceStats.entries())
      .map(([serviceId, stats]) => ({
        serviceId,
        serviceName: stats.name,
        count: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      month,
      totalRevenue,
      totalAppointments,
      averageRating,
      totalCommission,
      topServices
    };
  }

  /**
   * Calculate commission for a hairstylist based on their commission structure
   */
  private static calculateCommission(hairstylist: Hairstylist, sales: Sale[]): number {
    let totalCommission = 0;

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.type === 'service') {
          const commission = hairstylist.commissions?.find(c => c.serviceId === item.id);
          if (commission) {
            if (commission.type === 'percentage') {
              totalCommission += (item.price * commission.value) / 100;
            } else {
              totalCommission += commission.value;
            }
          }
        }
      });
    });

    return totalCommission;
  }

  /**
   * Update performance data for all hairstylists for the current month
   */
  static updateAllPerformance(
    hairstylists: Hairstylist[],
    sales: Sale[],
    appointments: Appointment[],
    services: Service[]
  ): Hairstylist[] {
    const currentMonth = new Date().toISOString().slice(0, 7);

    return hairstylists.map(hairstylist => {
      const currentPerformance = this.calculateMonthlyPerformance(
        hairstylist,
        sales,
        appointments,
        services,
        currentMonth
      );

      // Update or add current month performance
      const updatedPerformance = [...(hairstylist.performance || [])];
      const existingIndex = updatedPerformance.findIndex(p => p.month === currentMonth);

      if (existingIndex >= 0) {
        updatedPerformance[existingIndex] = currentPerformance;
      } else {
        updatedPerformance.push(currentPerformance);
      }

      // Keep only last 12 months of performance data
      updatedPerformance.sort((a, b) => b.month.localeCompare(a.month));
      const last12Months = updatedPerformance.slice(0, 12);

      return {
        ...hairstylist,
        performance: last12Months
      };
    });
  }

  /**
   * Get performance summary for a hairstylist across multiple months
   */
  static getPerformanceSummary(hairstylist: Hairstylist, months: number = 3): {
    totalRevenue: number;
    totalAppointments: number;
    averageRating: number;
    totalCommission: number;
    monthlyAverage: number;
  } {
    const recentPerformance = (hairstylist.performance || [])
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, months);

    const totalRevenue = recentPerformance.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalAppointments = recentPerformance.reduce((sum, p) => sum + p.totalAppointments, 0);
    const totalCommission = recentPerformance.reduce((sum, p) => sum + p.totalCommission, 0);
    
    const averageRating = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, p) => sum + p.averageRating, 0) / recentPerformance.length
      : 0;

    const monthlyAverage = recentPerformance.length > 0 ? totalRevenue / recentPerformance.length : 0;

    return {
      totalRevenue,
      totalAppointments,
      averageRating,
      totalCommission,
      monthlyAverage
    };
  }

  /**
   * Compare hairstylist performance
   */
  static comparePerformance(hairstylists: Hairstylist[], metric: 'revenue' | 'appointments' | 'commission' = 'revenue'): Array<{
    hairstylist: Hairstylist;
    value: number;
    rank: number;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const performance = hairstylists.map(hairstylist => {
      const monthPerformance = hairstylist.performance?.find(p => p.month === currentMonth);
      let value = 0;
      
      switch (metric) {
        case 'revenue':
          value = monthPerformance?.totalRevenue || 0;
          break;
        case 'appointments':
          value = monthPerformance?.totalAppointments || 0;
          break;
        case 'commission':
          value = monthPerformance?.totalCommission || 0;
          break;
      }
      
      return { hairstylist, value };
    });

    // Sort by value descending and add rank
    performance.sort((a, b) => b.value - a.value);
    
    return performance.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }
}

export default PerformanceTracker;