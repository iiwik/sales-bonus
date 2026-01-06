/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    // @TODO: Расчёт выручки от операции
    const { discount, sale_price, quantity } = purchase;
    const effectivePrice = sale_price * (1 - discount / 100);
    return effectivePrice * quantity;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчёт бонуса от позиции в рейтинге
        const { profit } = seller;

        if (index === 0) {
            // Продавец с наибольшей прибылью
            return profit * 0.15;
        } else if (index === 1 && total > 1) {
            // Второе место, если есть хотя бы 2 продавца
            return profit * 0.10;
        } else if (index === 2 && total > 2) {
            // Третье место, если есть хотя бы 3 продавца
            return profit * 0.10;
        } else if (index === total - 1) {
            // Последнее место
            return 0;
        } else {
            // Остальные продавцы
            return profit * 0.05;
        }
}

/**
 * Анализ продаж
 * @param data { sellers[], products[], purchase_records[] }
 * @param options { calculateRevenue, calculateBonus }
 * @returns {Array} Итоговая статистика по каждому продавцу
 */
function analyzeSalesData(data, options) {
    const { calculateRevenue, calculateBonus } = options;

    // @TODO: Проверка входных данных
    if (
        !data ||
        !Array.isArray(data.sellers) || data.sellers.length === 0 ||
        !Array.isArray(data.products) || data.products.length === 0 ||
        !Array.isArray(data.purchase_records) || data.purchase_records.length === 0
    ) {
        throw new Error('Некорректные входные данные');
    }


    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(s => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = {};
    sellerStats.forEach(s => sellerIndex[s.id] = s);

    const productIndex = {};
    data.products.forEach(p => productIndex[p.sku] = p);

    // @TODO: Расчёт выручки и прибыли для каждого продавца
        data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        if (!seller) return;

        seller.revenue += record.total_amount;

        record.items.forEach(item => {
            const product = productIndex[item.sku];
            if (!product) return;

            const revenue = calculateRevenue(item, product);
            const cost = product.purchase_price * item.quantity;

            seller.profit += revenue - cost;

            seller.products_sold[item.sku] =
                (seller.products_sold[item.sku] || 0) + item.quantity;
        });

        seller.sales_count += 1;
    });



    // @TODO: Сортировка продавцов по прибыли
    sellerStats.sort((a, b) => b.profit - a.profit);

    // @TODO: Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sellerStats.length, seller);
        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });

    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sellerStats.map(s => ({
        seller_id: s.id,
        name: s.name,
        revenue: +s.revenue.toFixed(2),
        profit: +s.profit.toFixed(2),
        sales_count: s.sales_count,
        top_products: s.top_products,
        bonus: +s.bonus.toFixed(2)
    }));
}
