import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, type Product } from '@/lib/products';
import {
  createOrder,
  addItemToOrder,
  confirmPayment,
  cancelOrder,
  type Order,
} from '@/lib/orders';
import { formatVnd } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Cart item type (local UI state) ─────────────────────────────────────────

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPriceVnd: number;
  taxRatePercent: number;
}

function calcCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPriceVnd * i.quantity, 0);
}

// ─── POS Page ─────────────────────────────────────────────────────────────────

export default function PosPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [q, setQ] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [payMethod, setPayMethod] = useState<'cash' | 'card'>('cash');
  const [showPayModal, setShowPayModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Product search ──────────────────────────────────────────────────────────
  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', q],
    queryFn: () => fetchProducts({ q: q || undefined, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  // ── Mutations ───────────────────────────────────────────────────────────────
  const newOrderMutation = useMutation({ mutationFn: createOrder });

  const addItemMutation = useMutation({
    mutationFn: ({ orderId, productId, quantity }: { orderId: string; productId: string; quantity: number }) =>
      addItemToOrder(orderId, { productId, quantity }),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ orderId, paymentMethod }: { orderId: string; paymentMethod: 'cash' | 'card' }) =>
      confirmPayment(orderId, { paymentMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSuccessMsg('Thanh toán thành công! Hoá đơn đang được tạo.');
      setCart([]);
      setActiveOrder(null);
      setShowPayModal(false);
    },
    onError: (err: Error) => {
      setErrorMsg('Lỗi thanh toán: ' + err.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      setCart([]);
      setActiveOrder(null);
      setSuccessMsg('Đơn hàng đã được huỷ.');
    },
  });

  // ── Helper: ensure an active order exists before adding items ───────────────
  const ensureOrder = useCallback(async (): Promise<Order> => {
    if (activeOrder) return activeOrder;
    const order = await newOrderMutation.mutateAsync();
    setActiveOrder(order);
    return order;
  }, [activeOrder, newOrderMutation]);

  // ── Add product to cart and sync with backend order ─────────────────────────
  const handleAddProduct = async (product: Product) => {
    setErrorMsg(null);
    try {
      const order = await ensureOrder();
      const existing = cart.find((i) => i.productId === product.id);
      const newQty = (existing?.quantity ?? 0) + 1;

      const updated = await addItemMutation.mutateAsync({
        orderId: order.id,
        productId: product.id,
        quantity: newQty,
      });

      setActiveOrder(updated);
      setCart((prev) => {
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: newQty } : i,
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            quantity: 1,
            unitPriceVnd: product.priceVnd,
            taxRatePercent: product.taxRatePercent,
          },
        ];
      });
    } catch (err) {
      setErrorMsg('Không thể thêm sản phẩm.');
    }
  };

  // ── Update quantity ──────────────────────────────────────────────────────────
  const handleQtyChange = async (productId: string, qty: number) => {
    if (!activeOrder) return;
    setErrorMsg(null);
    try {
      const updated = await addItemMutation.mutateAsync({
        orderId: activeOrder.id,
        productId,
        quantity: qty,
      });
      setActiveOrder(updated);
      if (qty === 0) {
        setCart((prev) => prev.filter((i) => i.productId !== productId));
      } else {
        setCart((prev) =>
          prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        );
      }
    } catch {
      setErrorMsg('Không thể cập nhật số lượng.');
    }
  };

  // ── Cancel order ────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!activeOrder) {
      setCart([]);
      return;
    }
    setErrorMsg(null);
    try {
      await cancelMutation.mutateAsync(activeOrder.id);
    } catch {
      setErrorMsg('Không thể huỷ đơn hàng.');
    }
  };

  // ── Confirm payment ─────────────────────────────────────────────────────────
  const handleConfirmPayment = async () => {
    if (!activeOrder) return;
    setErrorMsg(null);
    confirmMutation.mutate({ orderId: activeOrder.id, paymentMethod: payMethod });
  };

  const cartTotal = calcCartTotal(cart);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">POS — Thu ngân</h1>
        <span className="text-sm text-muted-foreground">{user?.email}</span>
      </header>

      {/* Feedback */}
      {successMsg && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-800 rounded px-4 py-3 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-green-600 hover:text-green-900">&times;</button>
        </div>
      )}
      {errorMsg && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 rounded px-4 py-3 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-600 hover:text-red-900">&times;</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Product search panel ─────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-medium mb-3">Tìm sản phẩm</h2>
            <Input
              placeholder="Tìm theo tên hoặc SKU…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mb-4"
            />

            {productsLoading && <p className="text-muted-foreground text-sm">Đang tải…</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {productData?.data
                .filter((p) => p.isActive)
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    disabled={addItemMutation.isPending || newOrderMutation.isPending}
                    className="border rounded-lg p-3 text-left hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                    <p className="text-sm font-semibold text-blue-700 mt-1">
                      {formatVnd(product.priceVnd)}
                    </p>
                  </button>
                ))}
            </div>

            {productData?.data.length === 0 && !productsLoading && (
              <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm.</p>
            )}
          </div>
        </div>

        {/* ── Cart panel ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4 sticky top-6">
            <h2 className="font-medium mb-3">
              Giỏ hàng
              {activeOrder && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  #{activeOrder.orderNumber}
                </span>
              )}
            </h2>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có sản phẩm nào
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatVnd(item.unitPriceVnd)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                        disabled={addItemMutation.isPending}
                        className="w-6 h-6 flex items-center justify-center rounded border hover:bg-gray-50 disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                        disabled={addItemMutation.isPending}
                        className="w-6 h-6 flex items-center justify-center rounded border hover:bg-gray-50 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <span className="w-20 text-right font-medium">
                      {formatVnd(item.unitPriceVnd * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-blue-700">{formatVnd(cartTotal)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={cart.length === 0 || confirmMutation.isPending}
                onClick={() => setShowPayModal(true)}
              >
                Thanh toán
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                disabled={cancelMutation.isPending}
                onClick={handleCancel}
              >
                Huỷ đơn hàng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment confirmation modal ─────────────────────────────────────── */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Xác nhận thanh toán</h3>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Phương thức thanh toán</p>
              <div className="flex gap-2">
                {(['cash', 'card'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      payMethod === m
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {m === 'cash' ? 'Tiền mặt' : 'Thẻ'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 font-semibold">
              <span>Tổng cộng</span>
              <span className="text-blue-700 text-lg">{formatVnd(cartTotal)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowPayModal(false)}
                disabled={confirmMutation.isPending}
              >
                Quay lại
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmPayment}
                disabled={confirmMutation.isPending}
              >
                {confirmMutation.isPending ? 'Đang xử lý…' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
