export default function PageHeader({ title, description, icon: Icon }) {
  return (
    <div className="border-b border-border bg-surface px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        {Icon && (
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" aria-hidden />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight gradient-text sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
