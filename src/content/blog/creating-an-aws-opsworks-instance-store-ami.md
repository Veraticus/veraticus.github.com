---
title: "Creating an AWS OpsWorks Instance Store AMI"
date: 2014-05-09 13:00:45 -0500
tags: [servers, aws, opsworks]
---
I've been doing a fair amount of work in Amazon's [OpsWorks](https://aws.amazon.com/opsworks/), in many ways an elegant service. Once you have a set of chef recipes provisioning properly, you'll want to create an AMI for the layer in question so that you don't have to wait through a long setup process again. Unfortunately, doing this in OpsWorks can be frustrating since the instructions for making it happen are scattered across [four](http://docs.aws.amazon.com/opsworks/latest/userguide/workinginstances-custom-ami.html) [entirely](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/creating-an-ami-instance-store.html) [different](http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/ec2-cli-get-set-up.html#install-ami-tools) [documents](http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html). For my own sanity I made a checklist of all the steps necessary to create an AMI on an instance store EC2 server: this is that checklist for anyone else who might find it useful.


## 0. Get your chef recipes working in OpsWorks

Don't do any of this until you have a fully-provisioned server working exactly as you'd expect. Make sure [auto healing](http://docs.aws.amazon.com/opsworks/latest/userguide/workinginstances-autohealing.html) is disabled for the layer. The rest of the steps assume you have such a properly set-up instance, a well configured layer, and that the original image was Ubuntu 12.04.

## 1. Download your X.509 certificates

Amazon has a pretty good [checklist](http://docs.aws.amazon.com/AmazonDevPay/latest/DevPayDeveloperGuide/X509Certificates.html) for how to do this. You need X.509 certificates so only you and Amazon can access your AMI, which for most layers is a sensible security precaution. For this walkthrough I'll assume you have the private key downloaded to ~/certs/pk-X509.pem and the the certificate downloaded to ~/certs/cert-X509.pem.

## 2. Transfer your certs to the server

On the server itself:

```bash
mkdir -p /tmp/cert/
```

On your local computer:

```
scp ~/certs/pk-X509.pem ~/certs/cert-X509.pem your-user@your-servers-public-dns:/tmp/cert/
```

This will securely transfer your certs up to the server. Make sure to replace `your-user` with whatever user on OpsWorks you have permission to access, and `your-servers-public-dns` with the public DNS record for your server.

## 3. Download the EC2 AMI tools

I'm not totally sure why the AMI tools and API tools are separate packages, but since they are you'll need to install them individually. For the AMI tools:

```bash
sudo apt-get install -y unzip
wget http://s3.amazonaws.com/ec2-downloads/ec2-ami-tools.zip
sudo mkdir -p /usr/local/ec2
sudo unzip ec2-ami-tools.zip -d /usr/local/ec2
export EC2_AMITOOL_HOME=/usr/local/ec2/ec2-ami-tools-1.5.3/
export PATH=$EC2_AMITOOL_HOME/bin:$PATH
```

If you got a different version of the AMI tools than 1.5.3, you'll want to replace the AMI tools directory with the proper version.

## 4. Download the EC2 API tools

A similar process to step 3.

```bash
wget http://s3.amazonaws.com/ec2-downloads/ec2-api-tools.zip
sudo unzip ec2-api-tools.zip -d /usr/local/ec2
sudo apt-get install -y openjdk-7-jre
export JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64/jre/
export EC2_HOME=/usr/local/ec2/ec2-api-tools-1.6.13.0/
export PATH=$PATH:$EC2_HOME/bin
export AWS_ACCESS_KEY=YourAccessKey
export AWS_SECRET_KEY=YourSecretKey
```

Again, if you downloaded a different version of the API tools, you'll need to change the API tools directory. Also replace `YourAccessKey` and `YourSecretKey` with your real access and secret keys.

## 5. Ensure your version of GRUB is correct

On Ubuntu 12.04, I didn't have to do anything except this:

```bash
sudo apt-get install -y grub gdisk kpartx
```

But if your image has boot problems GRUB is the most likely culprit. Amazon has a [good walkthrough](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/creating-an-ami-instance-store.html) of how to set up legacy GRUB properly -- following it should correct any boot issues you experience on your AMI.

## 6. Stop all services

Make sure everything and anything is stopped on the target server. A non-exclusive list:

```bash
sudo service monit stop
sudo service mysql stop
sudo service nginx stop
sudo service redis stop
sudo service memcached stop
sudo service opsworks-agent stop
```

Running services can destroy the integrity of the image. Make sure everything is stopped before you waste your time!

## 7. Remove instance configuration directories

All of the instance-specific config directories must be destroyed, or OpsWorks will fail to provision the new image.

```bash
sudo rm -rf /etc/aws/opsworks/ \
            /opt/aws/opsworks/ \
            /var/log/aws/opsworks/ \
            /var/lib/aws/opsworks/ \
            /etc/monit.d/opsworks-agent.monitrc \
            /etc/monit/conf.d/opsworks-agent.monitrc \
            /var/lib/cloud/
```

## 8. Bundle the volume

Finally, after all that setup, you're ready to actually bundle the volume.

```bash
ec2-bundle-vol -k /tmp/cert/pk-X509.pem \
               -c /tmp/cert/cert-X509.pem \
               -u 123456789012 \
               -r x86_64 \
               -e /tmp/cert \
               -i $(find /etc /usr /opt -name '*.pem' -o -name '*.crt' -o -name '*.gpg' | tr '\n' ',')
```

Note that we provide the certificate locations as part of this command, so if your certs are named differently change that name above. Also you need to provide the account ID number for the -u flag. You can find this on your [security credentials IAM page](https://console.aws.amazon.com/iam/home?#security_credential), or if you need more help, check out Amazon's [documentation on finding your account ID number](http://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html).

This command will probably take a long while to run.

## 9. Create and upload the volume to an S3 bucket

Once the volume is bundled, go to S3 and create a bucket to receive the machine image. Then run this command on your instance:

```bash
ec2-upload-bundle -b bucket_name/image_name \
                  -m /tmp/image.manifest.xml \
                  --region us-east-1
```

Replace `bucket_name` and `image_name` with the bucket you created in S3 and whatever you'd like to name the image, and the region with whatever region your bucket is located in (and where you want the AMI to be registered). This will also take awhile to run.

## 10. Register the AMI

Only one step left, and this is an easy one! You can register the AMI with this command:

```bash
ec2-register bucket_name/image_name/image.manifest.xml -n image_name --region us-east-1
```

You should now successfully see your new image in your list of registered AMIs for your region. Change your layer settings to use a custom image and select the AMI as the image for a new instance and try it out. Hopefully you'll have just cut out a fair amount of time from your instance provisioning process.
