import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Svg, Line, Path, G, Text as SvgText } from 'react-native-svg';
import { evaluate } from 'mathjs';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PLOT_WIDTH = SCREEN_WIDTH - 32;
const PLOT_HEIGHT = 320;
const PADDING = 28;
const GRAPH_MIN_X = -10;
const GRAPH_MAX_X = 10;
const GRAPH_MIN_Y = -10;
const GRAPH_MAX_Y = 10;

const DEFAULT_EXPRESSION = 'sin(x)';

const normalizeExpression = (raw) => {
  return raw
    .replace(/π/gi, 'pi')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '')
    .replace(/\^/g, '**');
};

const computeYForX = (expression, x) => {
  try {
    const normalized = normalizeExpression(expression);
    const value = evaluate(normalized, {
      x,
      pi: Math.PI,
      e: Math.E,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      abs: Math.abs,
      sqrt: Math.sqrt,
      log: Math.log,
      exp: Math.exp,
    });

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return null;
    }

    return value;
  } catch (error) {
    return null;
  }
};

const buildGraphPath = (expression) => {
  const steps = 400;
  let path = '';
  let firstPoint = true;

  for (let i = 0; i <= steps; i += 1) {
    const ratio = i / steps;
    const x = GRAPH_MIN_X + ratio * (GRAPH_MAX_X - GRAPH_MIN_X);
    const y = computeYForX(expression, x);

    if (y === null) {
      continue;
    }

    const plotX = PADDING + ((x - GRAPH_MIN_X) / (GRAPH_MAX_X - GRAPH_MIN_X)) * (PLOT_WIDTH - PADDING * 2);
    const plotY =
      PADDING +
      (1 - (y - GRAPH_MIN_Y) / (GRAPH_MAX_Y - GRAPH_MIN_Y)) * (PLOT_HEIGHT - PADDING * 2);

    if (Number.isNaN(plotX) || Number.isNaN(plotY)) {
      continue;
    }

    const point = `${firstPoint ? 'M' : 'L'} ${plotX} ${plotY}`;
    path += `${point} `;
    firstPoint = false;
  }

  return path.trim();
};

const AxisGrid = () => {
  const lines = [];

  for (let i = -10; i <= 10; i += 1) {
    const x = PADDING + ((i - GRAPH_MIN_X) / (GRAPH_MAX_X - GRAPH_MIN_X)) * (PLOT_WIDTH - PADDING * 2);
    const y = PADDING + ((i - GRAPH_MIN_Y) / (GRAPH_MAX_Y - GRAPH_MIN_Y)) * (PLOT_HEIGHT - PADDING * 2);

    lines.push(
      <Line
        key={`v-${i}`}
        x1={x}
        y1={PADDING}
        x2={x}
        y2={PLOT_HEIGHT - PADDING}
        stroke="#e7edf7"
        strokeWidth={1}
      />
    );
    lines.push(
      <Line
        key={`h-${i}`}
        x1={PADDING}
        y1={y}
        x2={PLOT_WIDTH - PADDING}
        y2={y}
        stroke="#e7edf7"
        strokeWidth={1}
      />
    );
  }

  return <>{lines}</>;
};

export default function App() {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [history, setHistory] = useState(['sin(x)', 'x^2', 'cos(x)']);
  const [activeExpression, setActiveExpression] = useState(DEFAULT_EXPRESSION);

  const graphPath = useMemo(() => {
    if (!activeExpression || !activeExpression.trim()) {
      return '';
    }

    return buildGraphPath(activeExpression);
  }, [activeExpression]);

  const handlePlot = () => {
    const trimmed = expression.trim();
    if (!trimmed) {
      return;
    }

    setActiveExpression(trimmed);
    setHistory((prev) => {
      if (prev.includes(trimmed)) {
        return prev;
      }
      return [trimmed, ...prev].slice(0, 6);
    });
  };

  const centerX = (PLOT_WIDTH - PADDING * 2) / 2 + PADDING;
  const centerY = (PLOT_HEIGHT - PADDING * 2) / 2 + PADDING;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>函数绘图</Text>

        <Text style={styles.label}>输入公式</Text>
        <TextInput
          value={expression}
          onChangeText={setExpression}
          style={styles.input}
          placeholder="例如：sin(x)"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.buttonRow}>
          <Pressable style={styles.primaryButton} onPress={handlePlot}>
            <Text style={styles.primaryText}>绘制</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setExpression('');
              setActiveExpression('');
            }}
          >
            <Text style={styles.secondaryText}>清空</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>示例公式</Text>
          <View style={styles.historyRow}>
            {history.map((item) => (
              <Pressable
                key={item}
                style={styles.chip}
                onPress={() => {
                  setExpression(item);
                  setActiveExpression(item);
                }}
              >
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.graphWrap}>
          <Svg width={PLOT_WIDTH} height={PLOT_HEIGHT} viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}>
            <AxisGrid />

            <Line
              x1={PADDING}
              y1={centerY}
              x2={PLOT_WIDTH - PADDING}
              y2={centerY}
              stroke="#6b7a90"
              strokeWidth={1.5}
            />
            <Line
              x1={centerX}
              y1={PADDING}
              x2={centerX}
              y2={PLOT_HEIGHT - PADDING}
              stroke="#6b7a90"
              strokeWidth={1.5}
            />

            {graphPath ? (
              <Path
                d={graphPath}
                fill="none"
                stroke="#3a86ff"
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}

            {[-10, -5, 0, 5, 10].map((value) => {
              const x = PADDING + ((value - GRAPH_MIN_X) / (GRAPH_MAX_X - GRAPH_MIN_X)) * (PLOT_WIDTH - PADDING * 2);
              const y = PADDING + ((value - GRAPH_MIN_Y) / (GRAPH_MAX_Y - GRAPH_MIN_Y)) * (PLOT_HEIGHT - PADDING * 2);

              return (
                <G key={`axis-label-${value}`}>
                  <SvgText x={x} y={PLOT_HEIGHT - 6} fontSize="10" fill="#6b7a90" textAnchor="middle">
                    {value}
                  </SvgText>
                  <SvgText x={12} y={y + 4} fontSize="10" fill="#6b7a90">
                    {value}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>

        <Text style={styles.resultText}>
          {activeExpression ? `当前公式：${activeExpression}` : '请输入公式后点击绘制'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1f2937',
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#dbe3f0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3a86ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#eef3ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryText: {
    color: '#3a86ff',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8edf5',
  },
  cardTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#edf4ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  graphWrap: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e8edf5',
    alignItems: 'center',
  },
  resultText: {
    marginTop: 16,
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
  },
});
