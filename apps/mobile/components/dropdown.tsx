import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

interface DropdownProps {
  icon: string;
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  dark?: boolean;
}

export function Dropdown({ icon, label, value, placeholder, options, onSelect, dark = false }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <View style={{ zIndex: open ? 100 : 1 }}>
      <TouchableOpacity
        style={[styles.field, dark && styles.fieldDark]}
        onPress={() => setOpen(!open)}
      >
        <Ionicons name={icon as any} size={13} color={Colors.orange} />
        <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
        <Text style={[styles.value, dark && styles.valueDark]} numberOfLines={1}>{selectedLabel}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={12} color={dark ? Colors.slate400 : Colors.slate300} />
      </TouchableOpacity>

      {open && (
        <View style={[styles.list, dark && styles.listDark]}>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator>
            {options.map(item => (
              <TouchableOpacity
                key={item.value}
                style={[styles.option, item.value === value && styles.optionActive, dark && item.value === value && styles.optionActiveDark]}
                onPress={() => { onSelect(item.value); setOpen(false); }}
              >
                <Text style={[styles.optionText, dark && styles.optionTextDark, item.value === value && styles.optionTextSelected]}>{item.label}</Text>
                {item.value === value && <Ionicons name="checkmark" size={12} color={Colors.orange} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate50, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderColor: Colors.slate200, gap: 8 },
  fieldDark: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' },
  label: { fontSize: 9, color: Colors.slate500, width: 55 },
  labelDark: { color: Colors.slate400 },
  value: { flex: 1, fontSize: 11, color: Colors.slate900, fontWeight: '500', textAlign: 'right' },
  valueDark: { color: Colors.white },
  list: { backgroundColor: Colors.white, borderRadius: 10, marginTop: 4, borderWidth: 1, borderColor: Colors.slate200, overflow: 'hidden' },
  listDark: { backgroundColor: Colors.slate800, borderColor: 'rgba(255,255,255,0.1)' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  optionActive: { backgroundColor: Colors.orangeLight + '15' },
  optionActiveDark: { backgroundColor: 'rgba(249,115,22,0.1)' },
  optionText: { fontSize: 11, color: Colors.slate700 },
  optionTextDark: { color: Colors.slate300 },
  optionTextSelected: { color: Colors.orange, fontWeight: '600' },
});
