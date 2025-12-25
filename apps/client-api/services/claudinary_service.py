# services/cloudinary_service.py
import cloudinary
import cloudinary.uploader
from config.clients import settings

# Configuration using your existing settings class
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

class ClaudinaryService:
    @staticmethod
    def upload_image(file_file, folder="portfolio_images"):
        """
        Uploads the file object to Cloudinary and returns the secure URL.
        """
        try:
            # Uploading directly from the file stream
            response = cloudinary.uploader.upload(
                file_file,
                folder=folder,
                resource_type="image"
            )
            return response.get("secure_url")
        except Exception as e:
            raise Exception(f"Cloudinary Error: {str(e)}")
    @staticmethod
    def upload_document(file_file, folder="verification_documents"):
        """
        Uploads documents (PDFs, Images, etc.) to Cloudinary.
        Using resource_type="auto" allows Cloudinary to handle non-image files.
        """
        try:
            response = cloudinary.uploader.upload(
                file_file,
                folder=folder,
                resource_type="auto"  # Important: allows PDF, DOCX, etc.
            )
            return response.get("secure_url")
        except Exception as e:
            raise Exception(f"Cloudinary Document Upload Error: {str(e)}")