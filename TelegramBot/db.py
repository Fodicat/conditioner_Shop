import psycopg2  # или другой драйвер для вашей БД
from config import DB_CONFIG

def get_db_connection():
    """
    Устанавливает соединение с базой данных.
    """
    return psycopg2.connect(**DB_CONFIG) 