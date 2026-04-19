import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createProduct,
  fetchProduct,
  updateProduct,
  type CreateProductPayload,
} from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const productSchema = z.object({
  sku: z
    .string()
    .max(100, 'SKU tối đa 100 ký tự')
    .regex(/^[A-Z0-9\-_]*$/i, 'SKU chỉ được chứa chữ, số, dấu - và _')
    .optional()
    .or(z.literal('')),
  name: z.string().min(1, 'Tên sản phẩm bắt buộc').max(255, 'Tên tối đa 255 ký tự'),
  threshold: z.coerce.number().int('Ngưỡng phải là số nguyên').min(0, 'Ngưỡng không được âm'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { sku: '', name: '', threshold: 0 },
  });

  useEffect(() => {
    if (existing) {
      reset({
        sku: existing.sku ?? '',
        name: existing.name,
        threshold: existing.threshold,
      });
    }
  }, [existing, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProductPayload) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products', { replace: true });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Omit<ProductFormData, 'sku'>) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate(`/products/${id}`, { replace: true });
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEdit) {
        const { sku: _sku, ...updateData } = data;
        void _sku;
        await updateMutation.mutateAsync(updateData);
      } else {
        const payload: CreateProductPayload = {
          name: data.name,
          threshold: data.threshold,
          ...(data.sku ? { sku: data.sku } : {}),
        };
        await createMutation.mutateAsync(payload);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (typeof msg === 'string' && msg.toLowerCase().includes('sku')) {
        setError('sku', { message: 'Mã SKU đã tồn tại trong kho' });
      } else {
        setError('root', { message: msg ?? 'Có lỗi xảy ra. Vui lòng thử lại.' });
      }
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Danh sách sản phẩm
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isEdit ? `Chỉnh sửa: ${existing?.name ?? ''}` : 'Thêm sản phẩm mới'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input
                id="name"
                placeholder="VD: Gạo tẻ 5kg"
                className="min-h-[44px]"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-red-600" role="alert">{errors.name.message}</p>
              )}
            </div>

            {/* SKU — read-only in edit mode */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                Mã SKU{' '}
                <span className="text-xs text-muted-foreground">
                  {isEdit ? '(không thể đổi)' : '(tuỳ chọn)'}
                </span>
              </Label>
              <Input
                id="sku"
                placeholder="VD: GAO-5KG-001"
                readOnly={isEdit}
                className={cn('min-h-[44px]', isEdit && 'bg-gray-50 cursor-not-allowed')}
                {...register('sku')}
                aria-invalid={!!errors.sku}
              />
              {errors.sku && (
                <p className="text-sm text-red-600" role="alert">{errors.sku.message}</p>
              )}
            </div>

            {/* Threshold */}
            <div className="space-y-2">
              <Label htmlFor="threshold">Ngưỡng cảnh báo sắp hết hàng</Label>
              <Input
                id="threshold"
                type="number"
                min={0}
                className="min-h-[44px]"
                {...register('threshold')}
                aria-invalid={!!errors.threshold}
              />
              <p className="text-xs text-muted-foreground">
                Để 0 nếu không cần cảnh báo. Khi tồn kho ≤ ngưỡng này, sản phẩm sẽ hiển thị "Sắp hết".
              </p>
              {errors.threshold && (
                <p className="text-sm text-red-600" role="alert">{errors.threshold.message}</p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2" role="alert">
                {errors.root.message}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-h-[44px]"
              >
                {isSubmitting ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px]"
                onClick={() => navigate('/products')}
                disabled={isSubmitting}
              >
                Huỷ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

