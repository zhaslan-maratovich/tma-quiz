/**
 * PlaceholderPage - заглушка для страниц в разработке
 */

interface PlaceholderPageProps {
    /** Заголовок страницы */
    title: string;
    /** Описание */
    description?: string;
    /** Эмодзи */
    emoji?: string;
}

export function PlaceholderPage({
    title,
    description = 'Страница в разработке',
    emoji = '🚧',
}: PlaceholderPageProps) {
    return (
        <div className="min-h-screen bg-tg-bg flex items-center justify-center p-6">
            <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-tg-secondary-bg flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{emoji}</span>
                </div>
                <h2 className="text-lg font-semibold text-tg-text mb-2">{title}</h2>
                <p className="text-sm text-tg-hint">{description}</p>
            </div>
        </div>
    );
}
