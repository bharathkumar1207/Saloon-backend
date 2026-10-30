-- Customer details are no longer collected at all during billing.
ALTER TABLE bills ALTER COLUMN customer_name DROP NOT NULL;
