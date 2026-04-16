import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

type Props = {
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
  empty?: boolean;
  emptyText?: string;
  compact?: boolean;
};

export function DataState({ loading, error, onRetry, children, empty, emptyText, compact }: Props) {
  if (loading) {
    return (
      <View style={[styles.center, compact && styles.compact]}>
        <ActivityIndicator size={compact ? 'small' : 'large'} color={Colors.orange} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.center, compact && styles.compact]}>
        <Ionicons name="cloud-offline-outline" size={compact ? 32 : 48} color={Colors.slate400} />
        <Text style={styles.errorText}>{error.message || 'Impossible de charger.'}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={[styles.center, compact && styles.compact]}>
        <Ionicons name="folder-open-outline" size={compact ? 32 : 48} color={Colors.slate400} />
        <Text style={styles.emptyText}>{emptyText || 'Aucun résultat.'}</Text>
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  compact: { padding: 16, minHeight: 120 },
  errorText: { color: Colors.slate600, textAlign: 'center', fontSize: 14 },
  emptyText: { color: Colors.slate500, textAlign: 'center', fontSize: 14 },
  retryBtn: { backgroundColor: Colors.orange, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: Colors.white, fontWeight: '600' },
});
