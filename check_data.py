import pandas as pd
df = pd.read_csv('ml-server/data/email_dataset_2.0.csv')
print("Sample inputs per category:")
for cat in df.category.unique():
    print(f"\n{cat}:")
    for r in df[df.category==cat]['email_input'].head(5):
        print(f"  - {r}")
print("\nAvg input length per category:")
print(df.groupby('category')['email_input'].apply(lambda x: x.str.len().mean()).round(1))
print("\nUnique inputs:", df['email_input'].nunique(), "out of", len(df))
