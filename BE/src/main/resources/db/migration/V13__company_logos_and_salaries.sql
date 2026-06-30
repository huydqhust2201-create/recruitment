-- ── Company logos ─────────────────────────────────────────────────────────────
UPDATE companies SET logo_url = 'https://logo.clearbit.com/fpt.com.vn'            WHERE name ILIKE '%FPT%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/google.com'             WHERE name ILIKE '%Google%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/grab.com'               WHERE name ILIKE '%Grab%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/nashtechglobal.com'     WHERE name ILIKE '%NashTech%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/shopee.vn'              WHERE name ILIKE '%Shopee%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/samsung.com'            WHERE name ILIKE '%Samsung%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/tiki.vn'                WHERE name ILIKE '%Tiki%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/vng.com.vn'             WHERE name ILIKE '%VNG%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/momo.vn'                WHERE name ILIKE '%momo%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/vingroup.net'           WHERE name ILIKE '%Vingroup%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/vinhomes.vn'            WHERE name ILIKE '%Vinhomes%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/mbbank.com.vn'          WHERE name ILIKE '%MB BANK%' OR name ILIKE '%MB Bank%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/techcombank.com.vn'     WHERE name ILIKE '%Techcombank%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/bidv.com.vn'            WHERE name ILIKE '%BIDV%' OR name ILIKE '%Bidv%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/masangroup.com'         WHERE name ILIKE '%Masan%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/nvidia.com'             WHERE name ILIKE '%NVIDIA%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/kiotviet.vn'            WHERE name ILIKE '%KiotViet%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/rikkeisoft.com'         WHERE name ILIKE '%Rikkeisoft%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/tmasolutions.com.vn'    WHERE name ILIKE '%TMA%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/vinamilk.com.vn'        WHERE name ILIKE '%Vinamilk%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/viettel.com.vn'         WHERE name ILIKE '%Viettel%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/vnpay.vn'               WHERE name ILIKE '%VNPAY%' OR name ILIKE '%VNPay%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/vpbank.com.vn'          WHERE name ILIKE '%VPBank%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/sungroup.com.vn'        WHERE name ILIKE '%Sun Group%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/hoasengroup.vn'         WHERE name ILIKE '%Hoa Sen%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/nexon.com'              WHERE name ILIKE '%Nexon%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/logivan.com'            WHERE name ILIKE '%Logivan%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/elcom.com.vn'           WHERE name ILIKE '%Elcom%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/cmcglobal.vn'           WHERE name ILIKE '%CMC%';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/onemount.com'           WHERE name ILIKE '%OneMount%' OR name ILIKE '%One Mount%';

-- Fallback avatar cho công ty chưa có logo
UPDATE companies SET logo_url =
    'https://ui-avatars.com/api/?name=' || REPLACE(name, ' ', '+') || '&background=0d7a5f&color=fff&size=128&bold=true&format=png'
WHERE logo_url IS NULL OR logo_url = '';

-- ── Jobs: cập nhật lương hiển thị theo cấp độ ─────────────────────────────────
-- Chỉ update những job đang ACTIVE và chưa có lương public
UPDATE jobs SET
    is_salary_public = true,
    salary_min = CASE level
        WHEN 'INTERN'  THEN 3000000
        WHEN 'JUNIOR'  THEN 10000000
        WHEN 'MID'     THEN 18000000
        WHEN 'SENIOR'  THEN 28000000
        WHEN 'LEAD'    THEN 40000000
        WHEN 'MANAGER' THEN 55000000
        ELSE 8000000
    END,
    salary_max = CASE level
        WHEN 'INTERN'  THEN 5000000
        WHEN 'JUNIOR'  THEN 18000000
        WHEN 'MID'     THEN 28000000
        WHEN 'SENIOR'  THEN 45000000
        WHEN 'LEAD'    THEN 65000000
        WHEN 'MANAGER' THEN 90000000
        ELSE 20000000
    END
WHERE status = 'ACTIVE'
  AND (is_salary_public = false OR salary_min IS NULL OR salary_max IS NULL);

-- Thêm chút đa dạng về mức lương dựa trên ngành (±20%)
-- IT / Tech jobs lương cao hơn
UPDATE jobs SET
    salary_min = ROUND(salary_min * 1.25),
    salary_max = ROUND(salary_max * 1.30)
WHERE status = 'ACTIVE'
  AND industry IN ('CNTT', 'KY_THUAT', 'KHOA_HOC')
  AND is_salary_public = true;

-- Finance/Banking jobs
UPDATE jobs SET
    salary_min = ROUND(salary_min * 1.15),
    salary_max = ROUND(salary_max * 1.20)
WHERE status = 'ACTIVE'
  AND industry IN ('TAI_CHINH', 'KE_TOAN')
  AND is_salary_public = true;
