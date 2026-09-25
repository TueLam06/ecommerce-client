import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrderById, cancelMyOrder } from "../api/orders";
import { STATUS_LABELS, STATUS_BADGE } from "../constants/orderStatus";

const fraunces = { fontFamily: "'Fraunces', serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

function formatVND(n) {
    return Number(n).toLocaleString("vi-VN") + "đ";
}

// Các bước hiển thị tiến trình đơn (đơn bị hủy thì không hiện tiến trình)
const STEPS = ["pending", "confirmed", "shipping", "completed"];

function MyOrderDetail() {
    const { id } = useParams();
    const { token } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async () => {
        if (!window.confirm(`Huỷ đơn hàng #${order.id}?`)) return;
        setCancelling(true);
        try {
            const updated = await cancelMyOrder(order.id, token);
            setOrder((prev) => ({ ...prev, status: updated.status }));
        } catch (err) {
            alert(err.message || "Lỗi huỷ đơn hàng");
        } finally {
            setCancelling(false);
        }
    };

    useEffect(() => {
        getMyOrderById(id, token)
            .then(setOrder)
            .catch((err) => setError(err.message || "Lỗi tải chi tiết đơn hàng"))
            .finally(() => setLoading(false));
    }, [id, token]);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="w-8 h-8 rounded-full border-2 border-[#D9D6CC] border-t-[#2F5233] animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12" style={inter}>
                <div className="rounded-md border border-[#E3C6C3] bg-[#FBF1F0] px-5 py-4 text-[#B3413B] text-sm mb-6">
                    Lỗi: {error || "Không tìm thấy đơn hàng"}
                </div>
                <Link to="/orders" className="text-sm text-[#2F5233] underline underline-offset-2">
                    ← Về lịch sử đơn hàng
                </Link>
            </div>
        );
    }

    const currentStep = STEPS.indexOf(order.status);

    return (
        <div className="min-h-screen bg-[#FAFAF8] px-6 py-12">
            <div className="max-w-4xl mx-auto" style={inter}>
                <Link to="/orders" className="text-sm text-[#6B6F63] hover:text-[#1F2420]">
                    ← Về lịch sử đơn hàng
                </Link>

                <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
                    <h1 style={fraunces} className="text-3xl text-[#1F2420]">
                        Đơn hàng #{order.id}
                    </h1>
                    <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE[order.status] || ""}`}
                    >
                        {STATUS_LABELS[order.status] || order.status}
                    </span>
                    {order.status === "pending" && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="ml-auto px-4 py-2 text-sm border border-[#B3413B] text-[#B3413B] rounded-sm hover:bg-[#FBF1F0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {cancelling ? "Đang huỷ..." : "Huỷ đơn hàng"}
                        </button>
                    )}
                </div>

                {currentStep >= 0 && (
                    <div className="rounded-md border border-[#E5E3DC] bg-white px-6 py-5 mb-6">
                        <div className="flex items-center">
                            {STEPS.map((step, i) => (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                                                i <= currentStep
                                                    ? "bg-[#2F5233] text-[#F5F3EE]"
                                                    : "bg-[#EFEDE6] text-[#6B6F63]"
                                            }`}
                                        >
                                            {i < currentStep ? "✓" : i + 1}
                                        </div>
                                        <span
                                            className={`mt-2 text-xs text-center whitespace-nowrap ${
                                                i <= currentStep ? "text-[#1F2420]" : "text-[#6B6F63]"
                                            }`}
                                        >
                                            {STATUS_LABELS[step]}
                                        </span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-2 mb-6 ${
                                                i < currentStep ? "bg-[#2F5233]" : "bg-[#EFEDE6]"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="rounded-md border border-[#E5E3DC] bg-white p-6 mb-6">
                    <h2 style={fraunces} className="text-lg text-[#1F2420] mb-4">
                        Thông tin giao hàng
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-[#6B6F63] mb-1">Người nhận</p>
                            <p className="text-[#1F2420] font-medium">{order.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-[#6B6F63] mb-1">Số điện thoại</p>
                            <p className="text-[#1F2420] font-medium">{order.phone}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-[#6B6F63] mb-1">Địa chỉ</p>
                            <p className="text-[#1F2420] font-medium">{order.address}</p>
                        </div>
                        <div>
                            <p className="text-[#6B6F63] mb-1">Ngày đặt</p>
                            <p className="text-[#1F2420] font-medium">
                                {order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-md border border-[#E5E3DC] bg-white">
                    <h2 style={fraunces} className="text-lg text-[#1F2420] px-6 pt-5 pb-2">
                        Sản phẩm
                    </h2>
                    <div className="px-6 divide-y divide-[#EFEDE6]">
                        {order.items.map((item) => {
                            const canLink = item.product_id !== null && item.product_is_active;
                            const name = canLink ? (
                                <Link to={`/products/${item.product_id}`} className="hover:text-[#2F5233]">
                                    {item.product_name}
                                </Link>
                            ) : (
                                item.product_name
                            );
                            return (
                                <div key={item.id} className="flex items-center gap-4 py-3">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.product_name}
                                            className="w-14 h-14 object-cover rounded-sm flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-sm bg-[#EFEDE6] flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[15px] text-[#1F2420]">
                                            {name}
                                            {!canLink && (
                                                <span className="text-[#6B6F63] italic text-sm"> (ngừng kinh doanh)</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-[#6B6F63]">
                                            {formatVND(item.price_at_purchase)} × {item.quantity}
                                        </div>
                                    </div>
                                    <div className="text-[15px] text-[#1F2420] whitespace-nowrap">
                                        {formatVND(item.price_at_purchase * item.quantity)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-baseline justify-between px-6 py-4 border-t border-[#EFEDE6] bg-[#FAFAF8]">
                        <span className="text-sm text-[#6B6F63]">Tổng cộng</span>
                        <span style={fraunces} className="text-2xl text-[#1F2420]">
                            {formatVND(order.total)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyOrderDetail;
