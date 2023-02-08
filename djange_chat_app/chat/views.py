import json
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from .models import Message, Chat
from django.http.response import HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.core import serializers

@login_required(login_url='/login/')
def index(request):
    """When user is logged in this function handles a post and get request

    Args:
        request (POST): creates a new Message object, converts it to a json, adds the username of the author and sends all this back as a jsonresponse
        request (GET): sends HTML Code and JSON for website

    Returns:
        HttpJsonResponse: Added Message with username of author
        HttpResponse : html code and Array messages
    """
    allChats = Chat.objects.all()
    if len(allChats) > 0:
        myChat = allChats[0]
    else:
        myChat = Chat.objects.create()
    if request.method == 'POST':
        newMessage = Message.objects.create(text=request.POST['textmessage'], chat=myChat ,author=request.user, receiver=request.user)
        newMessageSerialized = serializers.serialize('json', [ newMessage ])
        messageWithAuthor = json.loads(newMessageSerialized[1:-1])
        authorname = request.user.username
        messageWithAuthor.update({"authorname": authorname})
        newMessageWAuthorSerialized = json.dumps(messageWithAuthor)
        return JsonResponse(newMessageWAuthorSerialized, safe = False)
    chatMessages = Message.objects.filter(chat__id=myChat.id)
    return render(request, 'chat/index.html', {'messages': chatMessages})

def logout_view(request):
    """gets called when user wants to logout. Logs user out and redirects user

    Args:
        request (POST): logout

    Returns:
        HttpResponseRedirect: redirects to loginpage
    """
    logout(request)
    return HttpResponseRedirect('/login/')

def login_view(request):
    """gets called when user wants to login. Validates data and if user send right data, logs user in and redirects, 
            else return JSON saying data was wrong
            
            on GET request sends html data for page

    Args:
        request (POST): data of loginform is send
        request (GET): html code for loginpage

    Returns:
        HttpResponseRedirect: redirects to chatpage or page user wanted to see
        HttpJsonResponse: sends json back when login failed, because of wrong data
        HttpResponse: html code for loginpage
    """
    redirect = request.GET.get('next')
    if redirect == None:
        redirect = '/chat/'
    if request.method == 'POST':
        user = authenticate(username=request.POST.get('username'), password=request.POST.get('password'))
        if user:
            login(request, user)
            return HttpResponseRedirect(redirect)
        else:
            return JsonResponse({'wrongPassword': True})
    return render(request, 'auth/login.html')

def register_view(request):
    """gets called when user wants to register. Validates send data, if everything's correct, creates new user and
        redirects to chatpage, else sends feedback of what went wrong as json (username already taken or passwords are not the same)
        
        on GET request sends html data for page

    Args:
        request (POST): data of register form is send
        request (GET): html code for registerpage

    Returns:
        HttpResponseRedirect: redirects to chatpage
        HttpJsonResponse: sends json back when register failed, because of wrong data
        HttpResponse: html code for register
    """
    if request.method == 'POST':
        try:
            user = User.objects.get(username=request.POST.get('username'))
        except ObjectDoesNotExist:
            if request.POST.get('password') == request.POST.get('passwordAgain'):
                User.objects.create_user(username=request.POST.get('username'), password=request.POST.get('password'))
                user = authenticate(username=request.POST.get('username'), password=request.POST.get('password'))
                login(request, user)
                return HttpResponseRedirect('/chat/')
            else:
                return JsonResponse({'wrongPassword': True, 'usernameExists': False})
        return JsonResponse({'wrongPassword': False, 'usernameExists': True})
    return render(request, 'auth/register.html')