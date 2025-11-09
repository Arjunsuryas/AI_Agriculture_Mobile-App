import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  User,
  LogOut,
  Edit,
  Phone,
  MapPin,
  Briefcase,
  Mail,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Lightbulb,
} from 'lucide-react-native';

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  farm_name: string;
  location: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    farm_name: '',
    location: '',
  });

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user?.id).maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          farm_name: data.farm_name || '',
          location: data.location || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = () => {
    setWeather({
      temperature: 22 + Math.random() * 10,
      humidity: 60 + Math.random() * 30,
      rainfall: Math.random() * 5,
      wind_speed: 5 + Math.random() * 15,
    });
  };

  useEffect(() => {
    loadProfile();
    loadWeather();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.from('profiles').update(formData).eq('id', user?.id);

      if (error) throw error;
      setModalVisible(false);
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const recommendations = [
    {
      icon: <Lightbulb size={20} color="#f59e0b" />,
      title: 'Optimal Planting Season',
      description: 'Based on weather patterns, corn planting is recommended in 2-3 weeks',
    },
    {
      icon: <Droplets size={20} color="#3b82f6" />,
      title: 'Irrigation Alert',
      description: 'Low rainfall expected. Increase irrigation by 20% for the next week',
    },
    {
      icon: <CloudRain size={20} color="#6366f1" />,
      title: 'Rain Forecast',
      description: 'Heavy rain expected in 3 days. Postpone fertilizer application',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={40} color="#22c55e" />
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Farmer'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Edit size={20} color="#22c55e" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          {profile?.phone && (
            <View style={styles.infoRow}>
              <Phone size={20} color="#6b7280" />
              <Text style={styles.infoText}>{profile.phone}</Text>
            </View>
          )}
          {profile?.farm_name && (
            <View style={styles.infoRow}>
              <Briefcase size={20} color="#6b7280" />
              <Text style={styles.infoText}>{profile.farm_name}</Text>
            </View>
          )}
          {profile?.location && (
            <View style={styles.infoRow}>
              <MapPin size={20} color="#6b7280" />
              <Text style={styles.infoText}>{profile.location}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Mail size={20} color="#6b7280" />
            <Text style={styles.infoText}>{profile?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather Forecast</Text>
        {weather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherGrid}>
              <View style={styles.weatherItem}>
                <Sun size={32} color="#f59e0b" />
                <Text style={styles.weatherValue}>{weather.temperature.toFixed(1)}°C</Text>
                <Text style={styles.weatherLabel}>Temperature</Text>
              </View>

              <View style={styles.weatherItem}>
                <Droplets size={32} color="#3b82f6" />
                <Text style={styles.weatherValue}>{weather.humidity.toFixed(0)}%</Text>
                <Text style={styles.weatherLabel}>Humidity</Text>
              </View>

              <View style={styles.weatherItem}>
                <CloudRain size={32} color="#6366f1" />
                <Text style={styles.weatherValue}>{weather.rainfall.toFixed(1)}mm</Text>
                <Text style={styles.weatherLabel}>Rainfall</Text>
              </View>

              <View style={styles.weatherItem}>
                <Wind size={32} color="#22c55e" />
                <Text style={styles.weatherValue}>{weather.wind_speed.toFixed(1)}km/h</Text>
                <Text style={styles.weatherLabel}>Wind Speed</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>{rec.icon}</View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <Text style={styles.recommendationText}>{rec.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.label}>Farm Name</Text>
              <TextInput
                style={styles.input}
                value={formData.farm_name}
                onChangeText={(text) => setFormData({ ...formData, farm_name: text })}
                placeholder="Enter farm name"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Enter location"
                placeholderTextColor="#9ca3af"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

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
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  weatherItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  weatherValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginTop: 12,
    marginBottom: 40,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
