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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, MapPin, Trash2, Edit } from 'lucide-react-native';

interface Field {
  id: string;
  name: string;
  area_hectares: number;
  soil_type: string;
  current_crop: string;
  location: string;
  notes: string;
}

export default function FieldsScreen() {
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    area_hectares: '',
    soil_type: '',
    current_crop: '',
    location: '',
    notes: '',
  });

  const loadFields = async () => {
    try {
      const { data, error } = await supabase.from('fields').select('*').order('created_at', { ascending: false });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const openModal = (field?: Field) => {
    if (field) {
      setEditingField(field);
      setFormData({
        name: field.name,
        area_hectares: field.area_hectares.toString(),
        soil_type: field.soil_type,
        current_crop: field.current_crop,
        location: field.location,
        notes: field.notes,
      });
    } else {
      setEditingField(null);
      setFormData({
        name: '',
        area_hectares: '',
        soil_type: '',
        current_crop: '',
        location: '',
        notes: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingField(null);
  };

  const handleSave = async () => {
    try {
      const fieldData = {
        user_id: user?.id,
        name: formData.name,
        area_hectares: parseFloat(formData.area_hectares) || 0,
        soil_type: formData.soil_type,
        current_crop: formData.current_crop,
        location: formData.location,
        notes: formData.notes,
      };

      if (editingField) {
        const { error } = await supabase.from('fields').update(fieldData).eq('id', editingField.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('fields').insert(fieldData);
        if (error) throw error;
      }

      closeModal();
      loadFields();
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('fields').delete().eq('id', id);
      if (error) throw error;
      loadFields();
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Fields</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {fields.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No fields yet</Text>
            <Text style={styles.emptySubtext}>Add your first field to get started</Text>
          </View>
        ) : (
          fields.map((field) => (
            <View key={field.id} style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                <View style={styles.fieldIcon}>
                  <MapPin size={24} color="#22c55e" />
                </View>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldName}>{field.name}</Text>
                  <Text style={styles.fieldDetail}>{field.area_hectares} hectares</Text>
                </View>
                <View style={styles.fieldActions}>
                  <TouchableOpacity onPress={() => openModal(field)} style={styles.iconButton}>
                    <Edit size={20} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(field.id)} style={styles.iconButton}>
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldDetails}>
                {field.current_crop && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Crop:</Text>
                    <Text style={styles.detailValue}>{field.current_crop}</Text>
                  </View>
                )}
                {field.soil_type && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Soil Type:</Text>
                    <Text style={styles.detailValue}>{field.soil_type}</Text>
                  </View>
                )}
                {field.location && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{field.location}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingField ? 'Edit Field' : 'Add Field'}</Text>

            <ScrollView style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Field Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholderTextColor="#9ca3af"
              />

              <TextInput
                style={styles.input}
                placeholder="Area (hectares)"
                value={formData.area_hectares}
                onChangeText={(text) => setFormData({ ...formData, area_hectares: text })}
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />

              <TextInput
                style={styles.input}
                placeholder="Soil Type"
                value={formData.soil_type}
                onChangeText={(text) => setFormData({ ...formData, soil_type: text })}
                placeholderTextColor="#9ca3af"
              />

              <TextInput
                style={styles.input}
                placeholder="Current Crop"
                value={formData.current_crop}
                onChangeText={(text) => setFormData({ ...formData, current_crop: text })}
                placeholderTextColor="#9ca3af"
              />

              <TextInput
                style={styles.input}
                placeholder="Location"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholderTextColor="#9ca3af"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9ca3af"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  fieldDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  fieldDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 110,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
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
  input: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
