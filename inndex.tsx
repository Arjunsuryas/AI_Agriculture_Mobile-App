import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CloudRain, Sprout, TrendingUp, AlertTriangle } from 'lucide-react-native';

interface DashboardData {
  totalFields: number;
  activeFields: number;
  recentAnalyses: number;
  profile: any;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalFields: 0,
    activeFields: 0,
    recentAnalyses: 0,
    profile: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const [fieldsRes, analysesRes, profileRes] = await Promise.all([
        supabase.from('fields').select('*', { count: 'exact' }),
        supabase
          .from('ai_analyses')
          .select('*', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('profiles').select('*').eq('id', user?.id).maybeSingle(),
      ]);

      const activeFields = fieldsRes.data?.filter((f) => f.current_crop).length || 0;

      setData({
        totalFields: fieldsRes.count || 0,
        activeFields,
        recentAnalyses: analysesRes.count || 0,
        profile: profileRes.data,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{data.profile?.full_name || 'Farmer'}</Text>
        </View>
        <View style={styles.iconCircle}>
          <Sprout size={28} color="#22c55e" />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
          <MapPin size={24} color="#16a34a" />
          <Text style={styles.statValue}>{data.totalFields}</Text>
          <Text style={styles.statLabel}>Total Fields</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
          <TrendingUp size={24} color="#2563eb" />
          <Text style={styles.statValue}>{data.activeFields}</Text>
          <Text style={styles.statLabel}>Active Crops</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Scan size={24} color="#d97706" />
          <Text style={styles.statValue}>{data.recentAnalyses}</Text>
          <Text style={styles.statLabel}>AI Scans (7d)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Scan size={24} color="#22c55e" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Scan Crop Disease</Text>
            <Text style={styles.actionDesc}>Use AI to detect plant diseases</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <CloudRain size={24} color="#3b82f6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Weather Forecast</Text>
            <Text style={styles.actionDesc}>Check 7-day weather prediction</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <AlertTriangle size={24} color="#f59e0b" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Crop Recommendations</Text>
            <Text style={styles.actionDesc}>Get AI-powered planting advice</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>Start by adding a field or scanning a crop</Text>
        </View>
      </View>
    </ScrollView>
  );
}

import { MapPin, Scan } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
