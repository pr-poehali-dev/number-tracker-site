import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Operation {
  id: string;
  type: 'add' | 'subtract' | 'multiply' | 'divide';
  value: number;
  result: number;
  timestamp: Date;
}

const Index = () => {
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');
  const [operations, setOperations] = useState<Operation[]>([]);
  const [selectedTab, setSelectedTab] = useState<'calculator' | 'statistics'>('calculator');

  useEffect(() => {
    const saved = localStorage.getItem('numtracker-operations');
    if (saved) {
      const parsed = JSON.parse(saved);
      setOperations(parsed.map((op: any) => ({ ...op, timestamp: new Date(op.timestamp) })));
    }
    const savedValue = localStorage.getItem('numtracker-current');
    if (savedValue) {
      setCurrentValue(parseFloat(savedValue));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('numtracker-operations', JSON.stringify(operations));
    localStorage.setItem('numtracker-current', currentValue.toString());
  }, [operations, currentValue]);

  const performOperation = (type: 'add' | 'subtract' | 'multiply' | 'divide') => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      toast.error('Введите корректное число');
      return;
    }

    let result = currentValue;
    switch (type) {
      case 'add':
        result = currentValue + value;
        break;
      case 'subtract':
        result = currentValue - value;
        break;
      case 'multiply':
        result = currentValue * value;
        break;
      case 'divide':
        if (value === 0) {
          toast.error('Деление на ноль невозможно');
          return;
        }
        result = currentValue / value;
        break;
    }

    const operation: Operation = {
      id: Date.now().toString(),
      type,
      value,
      result,
      timestamp: new Date(),
    };

    setOperations([operation, ...operations]);
    setCurrentValue(result);
    setInputValue('');
    toast.success('Операция выполнена');
  };

  const clearAll = () => {
    setCurrentValue(0);
    setOperations([]);
    setInputValue('');
    toast.success('Все данные очищены');
  };

  const getOperationSymbol = (type: string) => {
    switch (type) {
      case 'add': return '+';
      case 'subtract': return '−';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return '';
    }
  };

  const totalOperations = operations.length;
  const additionsCount = operations.filter(op => op.type === 'add').length;
  const subtractionsCount = operations.filter(op => op.type === 'subtract').length;
  const multiplicationsCount = operations.filter(op => op.type === 'multiply').length;
  const divisionsCount = operations.filter(op => op.type === 'divide').length;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Числовой Учёт</h1>
          <p className="text-muted-foreground">Управление числами и статистика операций</p>
        </header>

        <div className="flex gap-4 mb-6 justify-center">
          <Button
            variant={selectedTab === 'calculator' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('calculator')}
            className="gap-2"
          >
            <Icon name="Calculator" size={20} />
            Калькулятор
          </Button>
          <Button
            variant={selectedTab === 'statistics' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('statistics')}
            className="gap-2"
          >
            <Icon name="BarChart3" size={20} />
            Статистика
          </Button>
        </div>

        {selectedTab === 'calculator' && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calculator" size={24} />
                  Калькулятор
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Текущее значение</p>
                  <p className="text-4xl font-bold text-primary">{currentValue.toFixed(2)}</p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Введите число..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="text-lg"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => performOperation('add')}
                      className="h-14 text-lg gap-2"
                      variant="default"
                    >
                      <Icon name="Plus" size={20} />
                      Сложить
                    </Button>
                    <Button
                      onClick={() => performOperation('subtract')}
                      className="h-14 text-lg gap-2"
                      variant="default"
                    >
                      <Icon name="Minus" size={20} />
                      Вычесть
                    </Button>
                    <Button
                      onClick={() => performOperation('multiply')}
                      className="h-14 text-lg gap-2"
                      variant="default"
                    >
                      <Icon name="X" size={20} />
                      Умножить
                    </Button>
                    <Button
                      onClick={() => performOperation('divide')}
                      className="h-14 text-lg gap-2"
                      variant="default"
                    >
                      <Icon name="Divide" size={20} />
                      Разделить
                    </Button>
                  </div>

                  <Button
                    onClick={clearAll}
                    variant="outline"
                    className="w-full h-12 gap-2"
                  >
                    <Icon name="Trash2" size={20} />
                    Очистить всё
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="History" size={24} />
                  История операций
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {operations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">История пуста</p>
                  ) : (
                    operations.map((op) => (
                      <div
                        key={op.id}
                        className="bg-muted p-4 rounded-lg flex items-center justify-between hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded">
                            <span className="text-primary font-bold text-lg">
                              {getOperationSymbol(op.type)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {getOperationSymbol(op.type)} {op.value.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {op.timestamp.toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-lg">{op.result.toFixed(2)}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'statistics' && (
          <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Всего операций</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">{totalOperations}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Текущее значение</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-foreground">{currentValue.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Последняя операция</CardTitle>
              </CardHeader>
              <CardContent>
                {operations.length > 0 ? (
                  <>
                    <p className="text-3xl font-bold text-primary mb-2">
                      {getOperationSymbol(operations[0].type)} {operations[0].value.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {operations[0].timestamp.toLocaleString('ru-RU')}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Нет данных</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Plus" size={20} />
                  Сложения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{additionsCount}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Minus" size={20} />
                  Вычитания
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{subtractionsCount}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="X" size={20} />
                  Умножения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{multiplicationsCount}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Divide" size={20} />
                  Деления
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{divisionsCount}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={24} />
                  Распределение операций
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Сложения', count: additionsCount, color: 'bg-green-500' },
                    { label: 'Вычитания', count: subtractionsCount, color: 'bg-red-500' },
                    { label: 'Умножения', count: multiplicationsCount, color: 'bg-blue-500' },
                    { label: 'Деления', count: divisionsCount, color: 'bg-yellow-500' },
                  ].map((item) => {
                    const percentage = totalOperations > 0 ? (item.count / totalOperations) * 100 : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
