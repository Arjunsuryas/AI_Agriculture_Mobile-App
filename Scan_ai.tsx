import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, FlipHorizontal, Scan, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react-native';

interface Analysis {
  disease: string;
  confidence: number;
  severity: string;
  recommendations: string[];
}

export default function AIScanScreen() {
  const { user } = useAuth();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={64} color="#6b7280" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need your permission to access the camera for AI crop disease detection
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const mockAIAnalysis = (): Analysis => {
    const diseases = [
      {
        disease: 'Healthy Plant',
        confidence: 0.92,
        severity: 'None',
        recommendations: [
          'Continue regular watering schedule',
          'Monitor for any changes in leaf color',
          'Maintain current fertilization routine',
        ],
      },
      {
        disease: 'Early Blight',
        confidence: 0.87,
        severity: 'Moderate',
        recommendations: [
          'Apply copper-based fungicide',
          'Remove infected leaves immediately',
          'Improve air circulation around plants',
          'Avoid overhead watering',
        ],
      },
      {
        disease: 'Powdery Mildew',
        confidence: 0.84,
        severity: 'Mild',
        recommendations: [
          'Apply sulfur-based fungicide',
          'Increase spacing between plants',
          'Water in the morning to allow foliage to dry',
          'Remove heavily infected leaves',
        ],
      },
      {
        disease: 'Leaf Spot',
        confidence: 0.79,
        severity: 'Moderate',
        recommendations: [
          'Apply appropriate fungicide treatment',
          'Remove and destroy infected plant material',
          'Avoid wetting foliage when watering',
          'Improve drainage in the field',
        ],
      },
    ];

    return diseases[Math.floor(Math.random() * diseases.length)];
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setAnalyzing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = mockAIAnalysis();
      setAnalysis(result);

      await supabase.from('ai_analyses').insert({
        user_id: user?.id,
        analysis_type: 'disease_detection',
        results: result,
        confidence_score: result.confidence,
        recommendations: result.recommendations.join('\n'),
      });

      setShowCamera(false);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(false)}>
                <Text style={styles.cameraButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
                <FlipHorizontal size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <View style={styles.cameraFooter}>
              <Text style={styles.cameraInstruction}>Position leaf within frame</Text>
              <TouchableOpacity
                style={[styles.captureButton, analyzing && styles.captureButtonDisabled]}
                onPress={handleCapture}
                disabled={analyzing}>
                {analyzing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Scan size={32} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.cameraHint}>Tap to scan</Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Crop Scanner</Text>
        <Text style={styles.subtitle}>Detect plant diseases instantly</Text>
      </View>

      {!analysis ? (
        <View style={styles.emptyState}>
          <View style={styles.scanIcon}>
            <Scan size={64} color="#22c55e" />
          </View>
          <Text style={styles.emptyTitle}>Start Scanning</Text>
          <Text style={styles.emptyText}>
            Use AI-powered image recognition to identify crop diseases and get instant recommendations
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setShowCamera(true)}>
            <Camera size={24} color="#fff" />
            <Text style={styles.startButtonText}>Open Camera</Text>
          </TouchableOpacity>

          <View style={styles.features}>
            <View style={styles.feature}>
              <CheckCircle size={20} color="#22c55e" />
              <Text style={styles.featureText}>Instant disease detection</Text>
            </View>
            <View style={styles.feature}>
              <CheckCircle size={20} color="#22c55e" />
              <Text style={styles.featureText}>Treatment recommendations</Text>
            </View>
            <View style={styles.feature}>
              <CheckCircle size={20} color="#22c55e" />
              <Text style={styles.featureText}>Save scan history</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultHeader,
              { backgroundColor: analysis.severity === 'None' ? '#dcfce7' : '#fef3c7' },
            ]}>
            {analysis.severity === 'None' ? (
              <CheckCircle size={48} color="#16a34a" />
            ) : (
              <AlertTriangle size={48} color="#d97706" />
            )}
            <Text style={styles.resultTitle}>{analysis.disease}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{Math.round(analysis.confidence * 100)}% Confidence</Text>
            </View>
          </View>

          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Severity Level</Text>
            <Text
              style={[
                styles.severityBadge,
                {
                  backgroundColor: analysis.severity === 'None' ? '#dcfce7' : '#fef3c7',
                  color: analysis.severity === 'None' ? '#16a34a' : '#d97706',
                },
              ]}>
              {analysis.severity}
            </Text>
          </View>

          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Recommendations</Text>
            {analysis.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendation}>
                <View style={styles.bullet} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetAnalysis}>
            <RefreshCw size={20} color="#fff" />
            <Text style={styles.resetButtonText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      )}
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scanIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  features: {
    gap: 16,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureText: {
    fontSize: 16,
    color: '#1f2937',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#22c55e',
  },
  topLeft: {
    top: '20%',
    left: '10%',
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: '20%',
    right: '10%',
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: '30%',
    left: '10%',
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: '30%',
    right: '10%',
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  cameraFooter: {
    alignItems: 'center',
    paddingBottom: 40,
    gap: 12,
  },
  cameraInstruction: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  cameraHint: {
    color: '#fff',
    fontSize: 14,
  },
  resultContainer: {
    gap: 24,
  },
  resultHeader: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    gap: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  confidenceBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginTop: 7,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
