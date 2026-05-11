# AWS Deployment Guide

## Prerequisites

- AWS CLI installed and configured (`aws configure`)
- Docker installed locally
- SSH key pair for EC2

---

## 1. Create ECR Repositories

```bash
# Backend image repository
aws ecr create-repository \
  --repository-name email-backend \
  --region us-east-1

# ML Server image repository
aws ecr create-repository \
  --repository-name email-ml-server \
  --region us-east-1
```

---

## 2. Launch EC2 t3.micro Instance

```bash
# Launch instance (Amazon Linux 2023)
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxx \
  --subnet-id subnet-xxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=email-backend}]'
```

### Security Group Rules

| Type       | Protocol | Port | Source    |
|------------|----------|------|-----------|
| SSH        | TCP      | 22   | Your IP   |
| HTTP       | TCP      | 80   | 0.0.0.0/0 |
| HTTPS      | TCP      | 443  | 0.0.0.0/0 |
| Custom TCP | TCP      | 8000 | 0.0.0.0/0 |

---

## 3. Configure EC2 Instance

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -aG docker ec2-user

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials on EC2 (use IAM role instead for production)
aws configure

# Create environment file
cat > /home/ec2-user/.env << 'EOF'
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql+asyncpg://user:pass@your-supabase-host:5432/postgres
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=ai-email-reply-storage
ML_SERVER_URL=http://localhost:8001
ALLOWED_ORIGINS=["https://your-frontend.vercel.app"]
EOF
```

---

## 4. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://ai-email-reply-storage --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ai-email-reply-storage \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket ai-email-reply-storage \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Set CORS for presigned URLs
aws s3api put-bucket-cors \
  --bucket ai-email-reply-storage \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["https://your-frontend.vercel.app"],
      "MaxAgeSeconds": 3000
    }]
  }'
```

---

## 5. Set Up Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string
3. Copy the **URI** (use the `postgresql+asyncpg://` format)
4. Run migrations:

```bash
cd backend
alembic upgrade head
```

---

## 6. Deploy with Docker Compose on EC2

```bash
# On EC2 instance
git clone https://github.com/your-org/ai-email-reply-generator.git
cd ai-email-reply-generator

# Pull model artifacts
pip install dvc[s3]
dvc pull ml-server/models/

# Start services
docker-compose -f docker/docker-compose.prod.yml up -d

# Verify
docker ps
curl http://localhost:8000/health
curl http://localhost:8001/health
```

---

## 7. Set Up GitHub Actions Secrets

In your GitHub repository → Settings → Secrets and variables → Actions:

| Secret Name          | Value                              |
|----------------------|------------------------------------|
| AWS_ACCESS_KEY_ID    | Your AWS access key                |
| AWS_SECRET_ACCESS_KEY| Your AWS secret key                |
| ECR_REGISTRY         | Your ECR registry URL              |
| EC2_HOST             | Your EC2 public IP                 |
| EC2_SSH_KEY          | Contents of your .pem file         |
| VERCEL_TOKEN         | Your Vercel API token              |
| VERCEL_ORG_ID        | Your Vercel org ID                 |
| VERCEL_PROJECT_ID    | Your Vercel project ID             |
| NEXT_PUBLIC_API_URL  | https://your-ec2-ip:8000/api/v1    |

---

## 8. Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Set environment variable in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` = `https://your-ec2-domain/api/v1`
