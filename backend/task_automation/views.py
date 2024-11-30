import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .functionalities.tasksgeneration import generate_tasks
from .functionalities.roadmapgeneration import generate_roadmap

@csrf_exempt
def generate_tasks_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            project_desc = data.get("project_desc", "")

            # Call the generate_tasks function to generate the tasks
            tasks = generate_tasks(project_desc)

            # Return the tasks as a JSON response
            return JsonResponse({"tasks": tasks}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def generate_roadmap_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            project_title = data.get("project_title", "")

            # Call the generate_tasks function to generate the tasks
            roadmap = generate_roadmap(project_title)

            # Return the tasks as a JSON response
            return JsonResponse({"roadmap": roadmap}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)